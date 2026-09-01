with open('pages/mood.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_fetch = """    const base64Audio = await blobToBase64(audioBlob);
    const res = await fetch('/.netlify/functions/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'audio/webm' },
      body: base64Audio,
    });"""

new_fetch = """    const base64Audio = await blobToBase64(audioBlob);
    const res = await fetch('/.netlify/functions/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: base64Audio }),
    });"""

if old_fetch in content:
    content = content.replace(old_fetch, new_fetch)
    print("mood.html OK: fetch now sends JSON instead of raw audio/webm")
else:
    print("mood.html FAILED: fetch block not found, may already be edited")

with open('pages/mood.html', 'w', encoding='utf-8') as f:
    f.write(content)
