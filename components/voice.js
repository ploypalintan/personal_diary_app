/* ═══════════════════════════════════════
   voice.js
   Shared voice-to-text for any input or textarea.
   Records with MediaRecorder, sends audio to the Netlify
   function (/.netlify/functions/transcribe), which calls
   Deepgram Nova-3. The API key never reaches the browser.

   attachVoice({ button, status, target, append })
═══════════════════════════════════════ */

const VOICE_MAX_SECONDS = 90; /* keeps the request under Netlify's ~6 MB body limit */

function attachVoice({ button, status, target, append = true, onText }) {
  let recorder = null;
  let chunks = [];
  let stream = null;
  let timer = null;

  const setStatus = (msg) => { if (status) status.textContent = msg; };
  const setLabel = (text) => {
    const label = button.querySelector('.mic-label');
    if (label) label.textContent = text;
  };

  if (!navigator.mediaDevices || !window.MediaRecorder) {
    button.disabled = true;
    setStatus('voice entry needs a newer browser');
    return;
  }

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setStatus('microphone access is needed for voice entry');
      console.error('Mic error:', err);
      return;
    }
    chunks = [];
    recorder = new MediaRecorder(stream); /* browser picks webm (Chrome) or mp4 (Safari) */
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = async () => {
      clearTimeout(timer);
      stream.getTracks().forEach((t) => t.stop());
      button.classList.remove('recording');
      button.setAttribute('aria-pressed', 'false');
      setLabel('speak');
      setStatus('transcribing…');
      const mimetype = (recorder.mimeType || 'audio/webm').split(';')[0];
      await send(new Blob(chunks, { type: mimetype }), mimetype);
    };
    recorder.start();
    button.classList.add('recording');
    button.setAttribute('aria-pressed', 'true');
    setLabel('stop');
    setStatus('listening… tap stop when you are done');
    timer = setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, VOICE_MAX_SECONDS * 1000);
  }

  async function send(blob, mimetype) {
    try {
      const audio = await blobToBase64(blob);
      const res = await fetch('/.netlify/functions/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio, mimetype }),
      });
      const data = await res.json();
      if (data.error) {
        setStatus('transcription failed, please try again');
        console.error('Transcription error:', data.error);
        return;
      }
      if (!data.transcript) { setStatus("didn't catch that, please try again"); return; }
      const t = target;
      t.value = append && t.value.trim() ? t.value.trim() + ' ' + data.transcript : data.transcript;
      t.dispatchEvent(new Event('input', { bubbles: true }));
      if (onText) onText(data.transcript);
      setStatus('✦ transcribed');
      setTimeout(() => setStatus(''), 2500);
    } catch (err) {
      setStatus('something went wrong, please try again');
      console.error('Send error:', err);
    }
  }

  button.addEventListener('click', () => {
    if (recorder && recorder.state === 'recording') recorder.stop();
    else start();
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
