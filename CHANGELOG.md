# Changelog

## Fork Initial Release — 2026-06-21

First commit of the personal fork of
[quran.com-frontend-next](https://github.com/quran/quran.com-frontend-next). The goal is a leaner
reading-focused UI. All changes below are relative to the upstream `production` branch at commit
`aff1a035b` (Ramadan release 4).

---

### Removed

#### Fundraising & Donations

- Removed `FundraisingBanner` from the navigation drawer and all donation CTA buttons
- Deleted `src/components/Fundraising/` (DonateButton, LearnMoreButton, HomepageFundraisingBanner,
  donation theme styles)
- Deleted `src/components/DonatePopup/`
- Removed `HomePageMessage` and `HomePageWelcomeMessage` (homepage donation cards)
- Removed `fundraisingAnalytics.ts` from QuranReader
- Removed `fundraisingBanner` and `welcomeMessage` Redux slices; removed `isDonationPopupVisible`
  from session slice
- Removed `makeDonateUrl` and `makeDonatePageUrl` API path helpers
- Removed the donation section from `pages/beyond-ramadan`

#### Top Banner

- Deleted the `Banner` component and `banner` Redux slice entirely
- Removed `bannerActive` layout classes from `AppContent`

#### Auth / Sign-in UI (surgical — auth subsystem kept)

- Removed `ProfileAvatarButton` from `NavbarBody`, `MobileStickyItemsBar`, and `NavigationDrawer`
- Converted the 6 auth pages (`/login`, `/auth`, `/logout`, `/complete-signup`, `/forgot-password`,
  `/reset-password`) to server-side redirect-to-home stubs
- Deleted `src/components/Login/` and `src/components/Profile/`
- Converted `/profile` page to a redirect-to-home stub

#### Quran Apps Portal

- Deleted `src/pages/apps.tsx` and `apps-portal.module.scss`
- Deleted `src/components/AppPortalSection/` (the "App Portal" feature card on the developers page)
- Removed `HomePageApps` section component and its import from the homepage
- Removed the "Quran apps" item from `NavigationDrawerList`
- Removed `APPS_URL` from `navigation.ts` and `SearchQuerySource.AppPortal`
- Removed `/apps` i18n.json route mapping
- Deleted all `locales/*/app-portal.json` and `locales/*/apps.json` namespace files
- Deleted `public/images/app-portal/` icon set

#### Ramadan Campaign

- Deleted pages `/ramadan` (PreparingForRamadan), `/ramadanchallenge`, `/ramadan2026`
- Removed the "Ramadan 2026" nav-drawer item
- Removed the `CommunitySection` ramadan card and `ReadingSection/NewCard` ramadan-challenge promo
  card
- Deleted the chapter-67 event banner (`useChapterEvent` hook + `ChapterHeader/ChapterEvent`)
- Deleted `src/components/RamadanChallenge/` (Enroll, EnrollmentCount, UnauthEnrollButton,
  EnrollButtonNotification)
- Deleted `RamadanActivity/ReadMoreCollapsible` and `RamadanActivityHero`
- Removed `GoalCategory.RAMADAN_CHALLENGE`, `RamadanChallengeGoalRequest`,
  `RamadanChallengeResponse` types
- Removed the ramadan branch in `addReadingGoal` and `getReadingGoalStatus`/`getReadingGoalCount`
- Removed `ROUTES.RAMADAN_2026`/`RAMADAN_CHALLENGE`, `getRamadanNavigationUrl`, and related external
  routes
- Removed OG image helpers `getPreparingForRamadan`/`getRamadanChallengeOgImageUrl`
- Removed the `/ramadan`→`/ramadan2026` redirect and the middleware case-insensitive block
- Removed i18n.json route mappings for `/ramadan` and `/ramadanchallenge`
- Relocated `RamadanActivities.module.scss` to `src/styles/` (shared by surviving pages)
- Deleted 2 chapter-event test specs and 2 navbar banner specs

#### Developers / About / Support / Product Updates Pages

- Deleted `/developers`, `/about-us`, `/support`, and `/product-updates` pages (including
  `[id].tsx`)
- Removed the nav-drawer "Developers" item and the "More" and "Our Projects" collapsible sections
- Deleted `MoreMenuCollapsible`, `OurProjectsCollapsible`, `LabsSection.tsx`, and
  `CommunitySection.tsx` from the drawer
- Deleted `src/components/Sanity/` (Page, Blocks, LocalizationMessage) and `src/lib/sanity.ts`
- Removed page constants `ABOUT_US_URL`, `DEVELOPERS_URL`, `PRODUCT_UPDATES_URL`, `SUPPORT_URL` from
  `navigation.ts`
- Removed Our-Projects external routes (QuranReflect, Sunnah, Nuqayah, legacy, corpus, Android, iOS,
  Feedback)
- Removed i18n.json mappings for the deleted pages
- Removed the `/*/product-updates*` next-sitemap exclusion entry
- Simplified `NavigationDrawerList` (now takes no props)

#### My Quran Page

- Deleted `/my-quran` page and its menu link
- Deleted `MyQuran/CollectionsList/`, `MyReadingBookmark/`, `RecentlySaved/`, `tabs/` (enum +
  RecentContent + NotesAndReflectionsTab), `Skeleton/`, `SignInPrompt/`, `SearchAndFilters/`, and
  `SavedTabContent/index.tsx`
- Deleted orphaned hooks `useRecentlySaved` and `useReadingBookmarkDisplay`
- Removed "My Quran" links from the nav drawer, ReadingSection header, and ExploreCard
  (end-of-surah)
- Rewired `CollectionDetail` back-button from My Quran → `/collections/all`
- Removed `MY_QURAN_URL`, `ROUTES.MY_QURAN`, `getMyQuranNavigationUrl` from `navigation.ts`
- Removed i18n.json `/my-quran` route mapping
- Removed the `/notes-and-reflections` → `/my-quran` redirect from `next.config`
- Deleted `MY_QURAN_RECENT_CONTENT_*` test IDs and `tests/**/my-quran/` specs

#### Lessons, Reflections & QuranReflect Integration

- Deleted pages `[chapterId]/reflections.tsx` and `lessons.tsx`
- Deleted `src/components/QuranReader/ReflectionView/` (entire tree)
- Deleted `src/utils/quranReflect/` and `src/types/QuranReflect/`
- Deleted `utils/lessonContentParser.ts` and `lessonQuizParser.ts`
- Deleted `StudyModeReflectionsTab.tsx` and `StudyModeLessonsTab.tsx`
- Deleted `HomePage/CommunitySection/` (QuranReflect homepage card)
- Removed QuranReflect-coupled Notes files: `usePostNoteToQr`, `useNotesWithRecentReflection`,
  `MyNotes/QrButton`, `PostQrConfirmationModal`, `ReflectionCard`, `ReflectionIntro/`
- Removed `REFLECTIONS`/`LESSONS` from `StudyModeTabId`, `TabId`, and all tab arrays/maps
- Removed `getVerseReflectionNavigationUrl`, `getVerseLessonNavigationUrl`,
  `getReflectionNavigationUrl` from `navigation.ts`
- Removed `FontSizeControl` reflection/lesson font-size types and config
- De-QR'd private Notes: removed `saveToQR`/`isPublic`/publish path from `useNotesStates`,
  `NoteFormModal`, `AddNoteModal`, `EditNoteModal`, `auth/api.ts`, `auth/apiPaths.ts`,
  `utility/cache.ts`, `utility/note.ts`, and `Note.ts` type
- Removed `reflectionFontScale`/`lessonFontScale` from `QuranReaderStyles` Redux type and slice
- Removed `selectedReflectionLanguages`/`selectedLessonLanguages` from `ReadingPreferences` slice
  and locale files
- Made Redux migration 39 inert (kept number to preserve migration chain)
- Removed action button entries from TranslationView bottom actions, StudyMode tab bar, word menu,
  and end-of-surah ExploreCard
- Fully removed Lessons & Reflections from the AyahWidget (embed) — params, form fields, footer
  actions, analytics
- Removed i18n.json route mappings for reflections and lessons; removed reflections block from
  next-sitemap
- Deleted reflections-page and lessons-page test specs

#### Footer

- Trimmed footer content to title + description only
- Removed `max-inline-size` caps in `Footer.module.scss` for full-width layout

---

### Changed

- `NavigationDrawerList` simplified — no longer accepts props; renders Read / Learn / Quran Radio /
  Reciters
- Auth pages now perform server-side redirects to home instead of rendering sign-in UI
- `/profile`, `/my-quran`, `/notes-and-reflections` pages now redirect to home
- `CollectionDetail` back-button points to `/collections/all` instead of My Quran
- Redux migration 12's `welcomeMessageInitialState` import replaced with an inline value (import was
  removed with the slice)
- `StudyModeControlsHeader` default content type changed from `'reflection'` to `'tafsir'`

---

### Added

- **Related verses** — reimplemented locally via proxy interception (`data/relatedVerses.ts`) with a
  gate change, since the upstream QuranReflect-backed endpoint is not accessible on the public QF
  gateway

---

### Infrastructure

- Switched to npm (upstream is yarn); lockfiles diverge
- `.env.local` targets QF public API (`USE_QF_PUBLIC_API=true`,
  `API_GATEWAY_URL=https://apis.quran.foundation`) with OAuth client credentials
