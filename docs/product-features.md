# Digital Zen — Product Features

> A cross-browser extension to improve your focus by blocking distracting websites and managing focus sessions.

**Author:** Denis Saveliev (DenHelloWorld) — [GitHub Profile](https://github.com/DenHelloWorld)

> **Note:** Backend/sync features are not yet activated. The descriptions below cover all frontend-facing functionality available in the current version.

---

## 1. Overview

Digital Zen is a productivity browser extension built with Angular 21, TypeScript, and Chrome Extension Manifest V3. It helps users maintain concentration by blocking distracting websites during scheduled **focus sessions**. It also includes a built-in **Pomodoro timer** for time management.

**Supported browsers:** Chrome, Edge, Brave, Firefox, Opera, Vivaldi, and other Chromium-based browsers.

---

## 2. Core Features

### 2.1. Focus Periods (Scheduled Blocking Sessions)

Users create **focus periods** — scheduled time blocks during which distracting websites are managed. Each period includes:

- **Name** — a custom label for the period.
- **Active days** — which days of the week the period applies to (Monday through Sunday).
- **Time range** — a start time and end time (e.g., 09:00–17:00). Supports overnight ranges (e.g., 22:00–02:00).
- **Quick time presets** — pre-configured time ranges:
  - 🌅 Morning (06:00–09:00)
  - 💼 Work (09:00–17:00)
  - 🌆 Evening (17:00–21:00)
  - ♾️ All day (00:00–23:59)
  - ⚙️ Custom (manual entry)
- **Block behaviour** — choose how websites are handled during the period (see §2.2).
- **Website library** — a per-period collection of websites to block or allow (see §2.3).
- **Activation toggle** — switch a period on/off with a single click.

### 2.2. Block Behaviour Modes

Each focus period can use one of three behaviour modes:

| Mode       | Icon | Behaviour                                                                 |
|------------|------|---------------------------------------------------------------------------|
| **Block**  | 🚫   | Selected websites are **blocked entirely** — tabs are closed.             |
| **Warn**   | ⚠️   | A **warning overlay** appears on selected websites; user can dismiss it.  |
| **Focus** (Whitelist) | 🧘 | Only selected websites are **accessible**; everything else is blocked. |

A dedicated **blocked page** is shown when a site is blocked, with the message: *"This website is blocked during your Digital Zen focus session."*

### 2.3. Website Library

Each period has its own **website library** — a folder-based collection of websites that are either blocked or allowed (depending on the block behaviour).

#### Preset Categories
Websites are organised into pre-defined folders:

| Folder              | Example Websites                                                                 |
|---------------------|----------------------------------------------------------------------------------|
| Social Media 📱     | X (Twitter), Instagram, Facebook, TikTok, VK, Snapchat, LinkedIn, Pinterest, Reddit, Discord, Twitch, Bluesky, Mastodon, Tumblr |
| AI 🤖               | ChatGPT, Claude, Gemini, Bing Chat, Grok, Perplexity, GitHub Copilot, Midjourney, Poe |
| Entertainment 🎮    | Netflix, Spotify, Disney+, Prime Video, HBO Max, Paramount+, Steam, 9GAG       |
| Shopping 🛒         | Amazon, AliExpress, eBay, Etsy, Temu                                           |
| News 📰             | Medium, Quora, Wikipedia, BBC, CNN, Reuters                                     |
| Education 🎓         | Coursera, Udemy, Khan Academy, Duolingo, edX                                    |
| Work Development 💻 | Stack Overflow, Hacker News, Habr, Notion, Miro                                 |
| Mail & Chat 📩      | Gmail, Outlook, Slack, Telegram                                                 |
| Finance & Crypto 💸 | Binance, TradingView, CoinMarketCap                                             |
| Health & Fitness 🍎 | MyFitnessPal, Strava, Fitbit                                                    |
| Default 🌐          | Generic catch-all                                                               |

#### Folder Management
- **Create custom folders** with emoji support in folder names.
- **Delete custom folders** (system folders are protected).
- **Add websites** to any folder manually by URL.
- **Move websites** between folders.
- **Delete websites** (moves to Wastebasket 🗑️).
- **Bulk activate/deactivate** all websites in a folder.
- **Individual website toggles** — checkbox per site.
- **Favicon display** — each website shows its favicon automatically.

#### Add Current Tab
While browsing, users can add the currently open tab directly to the website library via a button in the header, choosing which folder to place it in.

### 2.4. Focus Timer & Progress Display

When a focus session is active, the UI shows:

- **Live countdown** — remaining time for the current period (HH:MM:SS or MM:SS).
- **Progress ring** — a circular progress indicator around the focus widget.
- **Status badge** — current block behaviour (Block / Warn / Focus).
- **Active websites counter** — how many websites are currently set to be blocked.
- **Weekday indicator** — which days of the week the period covers.
- **Start/End time** — displayed at a glance.

### 2.5. Focus Session Controls

- **Start / Stop** toggle — a large switch in the footer.
- **Validation on start** — the extension checks whether the current time and day match the period's schedule. If not, the user receives a clear notification.
- **No-sites warning** — if no websites are activated, the user is warned before starting.

---

## 3. Pomodoro Timer

A fully integrated **Pomodoro timer** with the following features:

### 3.1. Configurable Durations

| Parameter            | Range       | Preset |
|----------------------|-------------|--------|
| Work session         | 1–120 min   | 25 min |
| Short break          | 1–60 min    | 5 min  |
| Long break           | 1–120 min   | 15 min |
| Pomodoros before long break | 2–5 | 4      |

All values are adjustable via **value stepper** controls with configurable step sizes.

### 3.2. Timer States

- **Idle** — ready to start.
- **Running** — active countdown with visual progress ring.
- **Paused** — timer suspended.
- **Reset** — confirmation dialog before resetting all progress.

### 3.3. Phase Progression

The timer automatically cycles through phases:
1. **Work** 🎓 (configurable duration)
2. **Short Break** ☕ (configurable duration)
3. Repeat until the configured number of pomodoros is reached
4. **Long Break** 🪑
5. Repeat the full cycle
6. **Finish** 🏆 — all cycles complete!

### 3.4. Cycle Progress Bar

A visual step bar at the bottom shows all pomodoro cycles with their current status (active, upcoming, completed).

### 3.5. Browser Notifications

Notifications are sent at phase transitions:
- "The break is over. Time to focus!"
- "It's time for a short break. Take a moment to relax."
- "You've earned a long break!"
- "All cycles are complete! Great job."

### 3.6. Settings Persistence

Pomodoro settings are automatically saved and persist across browser sessions.

---

## 4. Theme System

### 4.1. Light/Dark Mode

- **Dark theme** — default, eye-friendly for low-light environments.
- **Light theme** — bright, suitable for daytime use.
- Toggle via a dedicated theme switcher button in the header.

### 4.2. Automatic Detection

On first launch, the extension respects the system's `prefers-color-scheme` setting.

### 4.3. Persistence

The user's theme preference is saved to Chrome storage and remembered across sessions.

---

## 5. Navigation & Views

The extension uses a **tab-based navigation** with the following views:

| View             | Icon | Description                                        |
|------------------|------|----------------------------------------------------|
| **Focus** 🧘     | 🧘   | Main screen — current period, timer, start/stop    |
| **Periods** 📋   | 📋   | List of all focus periods with management controls |
| **Pomodoro** 🍅  | 🍅   | Full Pomodoro timer                                |
| **Add Period** ➕ | ➕   | Create a new focus period                          |
| **Edit Period** ✏️ | ✏️ | Edit an existing focus period                      |

### 5.1. Side Panel Support

The extension supports Chrome's **Side Panel API** — users can open Digital Zen in a side panel for persistent access while browsing.

### 5.2. Period List View

All periods are displayed as an accordion list, each showing:
- Period name
- Active toggle
- Block behaviour icon/status
- Weekday indicators
- Time range
- Active website count
- Edit and delete buttons
- Progress ring (if currently active)

### 5.3. Period Form View

A dedicated form for creating and editing periods with:
- Name input
- Block behaviour selector (three modes)
- Weekday multi-selector
- Time range selector (presets + manual)
- Website library access
- Activate-on-save toggle
- Validation feedback (duplicate name, invalid time range, missing days/websites)

---

## 6. Settings Management

### 6.1. Export / Import

- **Export settings** — downloads a JSON backup file (`digital-zen-backup-YYYY-MM-DD-HH-mm-ss.json`) containing all periods, library configuration, and Pomodoro settings.
- **Import settings** — restore from a previously exported backup file.

---

## 7. UI/UX Highlights

### 7.1. Visual Design

- **Dark/light themes** with CSS custom properties.
- **Circular progress indicators** on focus widgets and the Pomodoro timer.
- **Animated backgrounds** (breathing effect) on active periods.
- **BEM-based SCSS** with `dz-` prefix for consistent styling.
- **SVG icon system** — all icons are inline SVGs defined as symbols.
- **Emoji support** in folder names and time-range presets.
- **Toast notifications** for user feedback (info, success, warning, error).

### 7.2. Responsive & Popup UX

- **Popup mode** — the extension works as a browser toolbar popup.
- **Side panel mode** — persistent side panel in Chrome.
- **Popup dialogs** for confirmations (delete period, reset pomodoro, create folder, move website).
- **Smooth scrolling** to newly created/edited periods.

### 7.3. Accessibility

- Tooltips on all interactive elements.
- `aria-label` attributes on key controls.
- Focus indicators (keyboard navigation).
- Descriptive title attributes.

---

## 8. Technical Architecture (for context)

- **Framework:** Angular 21 with standalone components.
- **State management:** Angular Signals + RxJS.
- **Styling:** SCSS with BEM (`dz-` prefix).
- **Change detection:** `OnPush` for optimal performance.
- **Build:** Dual build system for Chromium and Firefox.
- **Permissions:** `storage`, `alarms`, `declarativeNetRequest`, `activeTab`, `scripting`, `sidePanel`, `notifications`.
- **Manifest:** V3 with service worker background script.

---

## 9. About the Author

**Digital Zen** was created and is actively developed by **Denis Saveliev (DenHelloWorld)**.

- GitHub: [github.com/DenHelloWorld](https://github.com/DenHelloWorld)
- The project is open-source (MIT License) and welcomes contributions.

---

*This document describes the functionality of Digital Zen as of version 1.0.1. Backend/sync features (cross-device data sync, cloud storage) are planned but not yet activated.*
