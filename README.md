# Setu (সেতু)

Learn Arabic from the Arabic you already speak in Bangla.

Bangla has well over a thousand words that came from Arabic: কিতাব, কলম, খবর, মসজিদ, হিসাব. Setu starts there. Each lesson takes a word you say every day, shows you its Arabic, and teaches you to read and say it properly. Then it opens the root behind it, so one word turns into a family of words.

I built it for my wife and me. It is free and non-commercial.

## What is here

- **Lessons 1 to 3** (36 words) in `player/index.html`. One file, opens in any browser.
- **Bangla or English.** Switch on the lesson list. Arabic is always the target.
- **Pronunciation under every Arabic word**, in Bangla script (খা-বার) or Latin (kha-bar). Sounds your language does not have are coloured.
- **Real voices** for every word: the Arabic, a Bangla line and an English line.
- `content/` holds the word data. Every word was checked against dictionary sources, listed per word. `content/REVIEW.md` has the notes and open questions.
- `canvas/project/` is the design canvas for the full app (home, root tree, sound drill, salah word by word, review, couple mode).

## Run it

Open `player/index.html` through any local server, for example:

```bash
cd player && python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Edit the words

Change `content/lesson*.json` or `content/en.json`, then rebuild:

```bash
python3 player/build.py
```

## Pronunciation rules

- Syllables split by hyphens: কি-তা-ব.
- Long ī and ū are written with plain ি and ু.
- A final ة is written -াহ: হিক-মাহ.
- ع is ‘ and ء is ’.
- Coloured in Bangla mode: ق ক্ব, خ খ, ح হ, ع, ء, ص স, ض দ্ব, ط ত্ব, ظ য, ث ছ, ذ য, غ গ়.

## Credits

Voices by [elevenlabs.io](https://elevenlabs.io): Anas (Arabic), Rafiq (Bangla), Alice (English). Generated on the free plan, so the audio is for non-commercial use with attribution.

Fonts: Noto Sans Bengali and Noto Naskh Arabic (Google Fonts).

Miraz Mullick
