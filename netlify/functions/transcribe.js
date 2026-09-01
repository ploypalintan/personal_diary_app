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
    const { audio } = JSON.parse(event.body);
    if (!audio) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No audio field in request body.' }) };
    }
    const audioBuffer = Buffer.from(audio, 'base64');

    const dgResponse = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'audio/webm',
        },
        body: audioBuffer,
      }
    );

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
