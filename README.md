# Roller Derby Hand Signal Flashcards

A simple web-based flashcard trainer with no backend.

This project helps officials and learners practice which referee hand signals map to which penalties in a current WFTDA-aligned rules context.

## Run

Open index.html in a web browser. No install, build, or backend is needed.

## Run On GitHub (Auto Deploy On Commit)

This repository now includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.
Every push to `main` automatically deploys the app to GitHub Pages.

One-time repository setup:

1. Open repository Settings -> Pages.
2. Under Build and deployment, set Source to GitHub Actions.
3. Push to `main` (or run the workflow manually from Actions) to publish.

Your live app URL will be:

https://hexa-decim8.github.io/hand-signal-cards/

## Controls

- Flip: Space or Enter
- Mark correct: C
- Mark missed: X
- Next card: Right Arrow
- Previous card: Left Arrow
- New round: R

## Content Notes

- Card text is paraphrased for study use.
- Official cue/code/image references are mapped from WFTDA officiating resources.
- Validate official wording and interpretation with WFTDA rules and officiating resources:
  - https://rules.wftda.com/
  - https://resources.wftda.org/officiating/
  - https://static.wftda.com/officiating/wftda-officiating-cues-codes-and-signals.pdf
  - https://static.wftda.com/officiating/wftda-penalty-quick-reference-guide.pdf
