# Asset register

Every image, sticker and piece of text in the app, and where it came from. Keep this up to date
before any App Store submission: Apple can ask who owns what.

| What | Where | Source |
|---|---|---|
| Room background, lace bands, lace paper, cloth cover | `assets/art/*.svg` | Drawn in code for this app (original) |
| Shelf, room and money line drawings | `assets/art/shelf.svg`, `room-line.svg`, `money.svg` | Drawn in code (original, no brand names or text) |
| Stickers (hearts, bow, sparkle, butterflies, clip, shoes, wax seal) | `assets/stickers/*.svg` | Drawn in code (original) |
| Cover tagline "a quiet place for your days" | `index.html` | Written for this app |
| Fonts (Manrope, Marcellus, Pinyon Script) | Google Fonts | Open Font License |
| Voice transcription | Deepgram | Third-party service, disclosed in the privacy note |

Removed on this clean-up (origin could not be verified): all former `.jpg` backgrounds, the photo
stickers (including two carrying other brands' marks: Angelic Pretty and rhode), the quote pool
(copyrighted lines) and the old cover tagline.

Rule going forward: add only art you made or have a written licence for, and add a row here.
Note: the removed files still exist in this repo's git history. If the repo stays public they can
still be downloaded from old commits; make the repo private (or rewrite history) before launch.
