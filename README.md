# Quranbasic.com

This project is available on quranbasic.com to use.

## quran.com-frontend — Personal Fork

This is a personal fork of the [Quran Foundation's](https://quran.foundation) open-source Next.js
frontend for [quran.com](https://quran.com). The goal is a leaner, less-bloated reading experience
while staying on the same backend infrastructure.

## What's been removed

- **Donation / fundraising UI** — donation banners, popups, and CTAs. Backend endpoints untouched.
- **Sign-in / auth UI** — login button, profile avatar, and auth pages stubbed to redirect home. The
  auth subsystem is intact; the app runs in permanent guest mode.
- **Ramadan campaign pages** — `/ramadan`, `/ramadanchallenge`, `/ramadan2026`, associated nav
  entries, and the chapter-event banner.
- **Quran Apps Portal** — the `/apps` third-party app showcase and all related nav entries.
- **Lessons & Reflections / QuranReflect integration** — action buttons, study-mode tabs, and the
  QuranReflect-backed pages. Private notes remain.
- **My Quran page** — the `/my-quran` tabbed hub (Saved/Recent/Notes). Collections pages still work.
- **Developers / About / Support / Product Updates pages** — removed along with the nav-drawer
  "More" and "Our Projects" sections and the Sanity CMS integration.
- **Footer** — trimmed to title + description only; full-width layout.

## What's been kept

- Quran Reader (translation view, reading view, audio player, word-by-word)
- Search
- Tafsir and word analysis
- Collections (`/collections/*`)
- Reciters and Quran Radio pages
- Related verses (reimplemented locally via proxy interception)
- The signed API proxy pointed at the QF public gateway

## Running locally

The fork targets the QF public API with OAuth client credentials. Set up `.env.local`:

```
API_GATEWAY_URL=https://apis.quran.foundation
USE_QF_PUBLIC_API=true
INTERNAL_CLIENT_ID=...
PROXY_SIGNATURE_TOKEN=...
SIGNATURE_TOKEN=...
```

Then:

```bash
npm run dev    # dev server on http://localhost:3000
npm run build  # production build
```

> The upstream repo is yarn-based; this fork uses npm.

---

Original project:
[github.com/quran/quran.com-frontend-next](https://github.com/quran/quran.com-frontend-next) — MIT
License
