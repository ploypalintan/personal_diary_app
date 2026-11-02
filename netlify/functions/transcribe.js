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
    const { audio, mimetype, keyterms } = JSON.parse(event.body);
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

    const callDeepgram = (withTerms) => {
      const params = new URLSearchParams({ model: 'nova-3', smart_format: 'true', punctuate: 'true' });
      if (withTerms) terms.forEach((t) => params.append('keyterm', t.trim()));
      return fetch(`https://api.deepgram.com/v1/listen?${params}`, {
        method: 'POST',
        headers: { Authorization: `Token ${apiKey}`, 'Content-Type': contentType },
        body: audioBuffer,
      });
    };

    let dgResponse = await callDeepgram(terms.length > 0);
    /* if Deepgram rejects the keyterms, retry once without them so voice still works */
    if (dgResponse.status === 400 && terms.length > 0) dgResponse = await callDeepgram(false);

    if (!dgResponse.ok) {
      const errText = await dgResponse.text();
      return {
        statusCode: dgResponse.status,
        body: JSON.stringify({ error: `Deepgram API error: ${errText}` }),
      };
    }

    const data = await dgResponse.json();
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${err.message}` }),
    };
  }
};
