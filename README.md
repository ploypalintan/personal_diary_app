# Personal Diary App with Deepgram Nova-3 Voice Journaling

A personal productivity app that replaced five separate apps I was juggling: a budgeting app, a mood journal, a to-do list, a product-expiry tracker, and none of them talking to each other. Built through AI-assisted development ("vibe coding"), then extended with voice input using Deepgram's Nova-3 speech-to-text API. It's a personal project: it works end to end, but it is not a production system.

## Why I Built This

I'm Type A, so I need a checklist just to feel like my day has shape. But I also don't want my finances tracked somewhere completely disconnected from how I'm actually feeling that day, money and mood are more connected than most apps treat them. And on some days, typing feels like too much. I want to talk it out, not type it into a box. So instead of switching between five apps, I built the one I actually wanted.

## What It Does

- **Character customization** — skin tone, hair, outfit, a small personal touch on the splash screen
- **Daily quote/poetry** — rotates by day
- **Checklist** — today's tasks, by category and priority
- **Mood journal** — a free-text diary entry, now with voice input
- **Makeup & skincare tracker** — product, brand, shade, date opened and period-after-opening; the expiry date is calculated, the list is sorted soonest-first, and a banner warns about anything expiring within 30 days. You can add a product by saying it ("add Cetaphil moisturiser, opened today"): the voice phrase pre-fills the form and you confirm before saving.
- **Expense tracking** — multi-currency income and spending log

## The Voice Feature

A labelled **speak** button on the today page (add a task by voice), the mood page (dictate a journal entry) and the makeup tracker (add a product by voice) records your voice, sends it to a serverless function, and returns a transcript from Deepgram's Nova-3 model, inserted straight into the text box. The recording code lives in one shared file, `components/voice.js`.

**Why a serverless function, not a direct API call from the browser:** calling Deepgram's API directly from client-side JavaScript would expose the API key to anyone who opened developer tools. The `netlify/functions/transcribe.js` function keeps the key server-side, in a Netlify environment variable, and only ever proxies the audio through.

## Real Bugs I Hit and Fixed

Getting this live wasn't clean, and I think that's worth documenting honestly rather than pretending it was.

**1. Silent function deployment failure.** My first deploy used Netlify's drag-and-drop upload ("Netlify Drop"), which turned out to not process the `netlify/functions` directory at all. The site went live, but the backend function silently didn't exist. Fixed by switching to the Netlify CLI (`netlify deploy --prod`), which properly builds and registers serverless functions.

**2. Double base64-encoding.** Once the function was actually live, transcription kept failing with a "corrupt or unsupported data" error from Deepgram. Traced through the browser console and function logs to the real cause: Netlify was automatically re-encoding the already-base64-encoded audio a second time before my function ever saw it. Fixed by sending the audio as JSON (`{ audio: base64Audio }`) instead of a raw `audio/webm` body, so it only gets encoded once.

## Result

In my own daily use, text appears a few seconds after I stop recording. I haven't formally benchmarked latency or accuracy yet; a small test across Singapore English, Mandarin, Thai and mixed-language clips is planned and will be written up in `docs/accuracy-test.md`.

## Setup

1. Add `DEEPGRAM_API_KEY` as an environment variable in your Netlify site settings (never in code).
2. Deploy with the Netlify CLI (`netlify deploy --prod`) so the function in `netlify/functions` is built.
3. Recording is capped at about 90 seconds to stay inside Netlify's request size limit.

## Tech Stack

Vanilla JavaScript · HTML/CSS · Netlify Serverless Functions · Deepgram Nova-3 API · localStorage for state persistence

## Live App

[my-diary-test.netlify.app](https://my-diary-test.netlify.app)
