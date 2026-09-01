# Personal Diary App — with Deepgram Nova-3 Voice Journaling

A personal productivity app that replaced five separate apps I was juggling: a budgeting app, a mood journal, a to-do list, a wishlist tracker, and none of them talking to each other. Built through AI-assisted development ("vibe coding"), then extended with real, production voice journaling using Deepgram's Nova-3 speech-to-text API.

## Why I Built This

I'm Type A, so I need a checklist just to feel like my day has shape. But I also don't want my finances tracked somewhere completely disconnected from how I'm actually feeling that day, money and mood are more connected than most apps treat them. And on some days, typing feels like too much. I want to talk it out, not type it into a box. So instead of switching between five apps, I built the one I actually wanted.

## What It Does

- **Character customization** — skin tone, hair, outfit, a small personal touch on the splash screen
- **Daily quote/poetry** — rotates by day
- **Checklist** — today's tasks, by category and priority
- **Mood journal** — a free-text diary entry, now with voice input
- **Wishlist** — things to work toward
- **Expense tracking** — multi-currency income and spending log

## The Voice Feature

The mood journal has a microphone button that records your voice, sends it to a secure serverless function, and returns a transcript from Deepgram's Nova-3 model, inserted directly into your entry.

**Why a serverless function, not a direct API call from the browser:** calling Deepgram's API directly from client-side JavaScript would expose the API key to anyone who opened developer tools. The `netlify/functions/transcribe.js` function keeps the key server-side, in a Netlify environment variable, and only ever proxies the audio through.

## Real Bugs I Hit and Fixed

Getting this live wasn't clean, and I think that's worth documenting honestly rather than pretending it was.

**1. Silent function deployment failure.** My first deploy used Netlify's drag-and-drop upload ("Netlify Drop"), which turned out to not process the `netlify/functions` directory at all. The site went live, but the backend function silently didn't exist. Fixed by switching to the Netlify CLI (`netlify deploy --prod`), which properly builds and registers serverless functions.

**2. Double base64-encoding.** Once the function was actually live, transcription kept failing with a "corrupt or unsupported data" error from Deepgram. Traced through the browser console and function logs to the real cause: Netlify was automatically re-encoding the already-base64-encoded audio a second time before my function ever saw it. Fixed by sending the audio as JSON (`{ audio: base64Audio }`) instead of a raw `audio/webm` body, so it only gets encoded once. See `apply_mic_changes.py` and `fix_encoding.py` for the actual patch scripts used to apply these fixes.

## Result

End-to-end latency from tapping the mic to transcribed text appearing is under 5 seconds, consistent with Nova-3's sub-300ms model processing plus network round-trip. Zero failed transcriptions since the encoding fix. It replaced five apps I used to juggle separately, and I actually use it.

## Tech Stack

Vanilla JavaScript · HTML/CSS · Netlify Serverless Functions · Deepgram Nova-3 API · localStorage for state persistence

## Live App

[my-diary-test.netlify.app](https://my-diary-test.netlify.app)
