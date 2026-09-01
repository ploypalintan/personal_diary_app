with open('pages/mood.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_textarea = '<textarea class="journal-box" id="journalBox" placeholder="write anything your heart wants to say today…"></textarea>'
new_textarea = '''<div class="journal-wrap">
      <textarea class="journal-box" id="journalBox" placeholder="write anything your heart wants to say today… or tap the mic to speak it"></textarea>
      <button class="mic-btn" id="micBtn" onclick="toggleRecording()" title="speak your entry" type="button">🎙️</button>
    </div>
    <div class="mic-status" id="micStatus"></div>'''

if old_textarea in content:
    content = content.replace(old_textarea, new_textarea)
    print("Step 1 OK: textarea wrapped with mic button")
else:
    print("Step 1 FAILED: textarea line not found")

old_style = '<style>'
mic_css = '''<style>
    .journal-wrap { position: relative; }
    .mic-btn {
      position: absolute; bottom: 12px; right: 12px;
      width: 34px; height: 34px; border-radius: 50%;
      border: 0.5px solid var(--border); background: #fff;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 15px; transition: all 0.2s;
    }
    .mic-btn:hover { background: var(--almond-light); }
    .mic-btn.recording {
      background: var(--mauve); border-color: var(--mauve);
      animation: micPulse 1.2s ease-in-out infinite;
    }
    @keyframes micPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(151,114,123,0.4); }
      50%      { box-shadow: 0 0 0 8px rgba(151,114,123,0); }
    }
    .mic-status { font-size: 11px; color: var(--text-muted); font-style: italic; margin-top: 6px; min-height: 14px; }
'''

if old_style in content:
    content = content.replace(old_style, mic_css, 1)
    print("Step 2 OK: mic CSS inserted")
else:
    print("Step 2 FAILED: <style> tag not found")

old_end = '  renderHistory();\n</script>'
mic_js = '''  renderHistory();

/* VOICE ENTRY (Deepgram Nova-3) */
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

async function toggleRecording() {
  if (isRecording) { mediaRecorder.stop(); return; }
  await startRecording();
}

async function startRecording() {
  const micBtn = document.getElementById('micBtn');
  const status = document.getElementById('micStatus');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      isRecording = false;
      micBtn.classList.remove('recording');
      status.textContent = 'transcribing…';
      stream.getTracks().forEach((t) => t.stop());
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      await sendToDeepgram(audioBlob);
    };
    mediaRecorder.start();
    isRecording = true;
    micBtn.classList.add('recording');
    status.textContent = 'listening… tap again to stop';
  } catch (err) {
    status.textContent = 'microphone access needed to use voice entry';
    console.error('Mic error:', err);
  }
}

async function sendToDeepgram(audioBlob) {
  const status = document.getElementById('micStatus');
  try {
    const base64Audio = await blobToBase64(audioBlob);
    const res = await fetch('/.netlify/functions/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'audio/webm' },
      body: base64Audio,
    });
    const data = await res.json();
    if (data.error) {
      status.textContent = 'transcription failed — try again';
      console.error('Deepgram error:', data.error);
      return;
    }
    const box = document.getElementById('journalBox');
    box.value = box.value.trim() ? box.value.trim() + ' ' + data.transcript : data.transcript;
    status.textContent = data.transcript ? '✦ transcribed' : "didn't catch that — try again";
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    status.textContent = 'something went wrong — try again';
    console.error('Send error:', err);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => { resolve(reader.result.split(',')[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
</script>'''

if old_end in content:
    content = content.replace(old_end, mic_js, 1)
    print("Step 3 OK: mic JS inserted")
else:
    print("Step 3 FAILED: end of script block not found")

with open('pages/mood.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done — check the three step messages above")
