exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DEEPGRAM_API_KEY is not set in Netlify environment variables.' }),
    };
  }

  try {
    const { audio, mimetype, keyterms, language } = JSON.parse(event.body);
    /* a language the person picked in the app; anything else means auto-detect */
    const PICKED = ['en', 'zh', 'th', 'de'].includes(language) ? language : null;
    if (!audio) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No audio field in request body.' }) };
    }
    const audioBuffer = Buffer.from(audio, 'base64');
    if (audioBuffer.length > 5 * 1024 * 1024) {
      return { statusCode: 413, body: JSON.stringify({ error: 'Recording too long. Keep it under about 90 seconds.' }) };
    }
    /* browsers record webm (Chrome/Firefox) or mp4 (Safari); only pass through audio/video types */
    const contentType = /^(audio|video)\/[a-z0-9.+-]+$/i.test(mimetype || '') ? mimetype : 'audio/webm';

    /* Optional keyterm prompting (Nova-3): helps with brand names. Validated and capped. */
    const terms = Array.isArray(keyterms)
      ? keyterms.filter((t) => typeof t === 'string' && t.trim().length > 0 && t.length <= 40).slice(0, 60)
      : [];

    /* Nova-3 multilingual (language=multi) follows mid-sentence switches; hints nudge detection
       toward the languages Ploy actually speaks: English, Mandarin, Thai, German. */
    const HINTS = ['en', 'zh', 'th', 'de'];
    const callDeepgram = ({ withTerms, multi, hints, lang }) => {
      const params = new URLSearchParams({ model: 'nova-3', smart_format: 'true', punctuate: 'true' });
      if (lang) params.set('language', lang);
      else if (multi) params.set('language', 'multi');
      if (multi && hints) HINTS.forEach((h) => params.append('language_hint', h));
      if (withTerms) terms.forEach((t) => params.append('keyterm', t.trim()));
      return fetch(`https://api.deepgram.com/v1/listen?${params}`, {
        method: 'POST',
        headers: { Authorization: `Token ${apiKey}`, 'Content-Type': contentType },
        body: audioBuffer,
      });
    };

    /* try the richest request first, then step down if Deepgram rejects an option (HTTP 400),
       so voice always keeps working: multi+hints+keyterms -> multi+hints -> multi -> plain English */
    const attempts = PICKED ? [
      { withTerms: terms.length > 0, lang: PICKED },
      { withTerms: false, lang: PICKED },
      { withTerms: false, multi: true, hints: true },
    ] : [
      { withTerms: terms.length > 0, multi: true, hints: true },
      { withTerms: false, multi: true, hints: true },
      { withTerms: false, multi: true, hints: false },
      { withTerms: false, multi: false, hints: false },
    ].filter((a, i) => i === 0 || terms.length > 0 || i > 1);
    let dgResponse;
    for (const a of attempts) {
      dgResponse = await callDeepgram(a);
      if (dgResponse.status !== 400) break;
    }

    if (!dgResponse.ok) {
      const errText = await dgResponse.text();
      return {
        statusCode: dgResponse.status,
        body: JSON.stringify({ error: `Deepgram API error: ${errText}` }),
      };
    }

    const data = await dgResponse.json();
    const alt = data?.results?.channels?.[0]?.alternatives?.[0] || {};
    const transcript = alt.transcript || '';
    const confidence = typeof alt.confidence === 'number' ? alt.confidence : null;
    /* multilingual responses tag each word with its language */
    const languages = [...new Set((alt.words || []).map((w) => w.language).filter(Boolean))];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, confidence, languages }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${err.message}` }),
    };
  }
};
