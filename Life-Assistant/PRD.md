# PRD: Life Assistant

## Problem Statement
The user struggles to balance professional (office tasks, missed calls, emails) and private life (birthdays, reminders) in a single, clean interface. Scattered notifications across multiple apps lead to missed obligations.

## Solution
A cross-platform mobile app (React Native) that aggregates professional and personal reminders into a unified, high-aesthetic dashboard. It syncs with Google (Calendar/Gmail) and allows for rapid manual entry.

## User Stories
1. As a professional, I want to sync my Google Calendar so that I can see all my office meetings in one place.
2. As a busy individual, I want to manually enter quick reminders so that I don't forget spontaneous tasks.
3. As a friend, I want the app to sync birthdays from my contacts so that I never miss a celebration.
4. As a user, I want to manually add birthdays with recurring annual reminders so that I can track people not in my contact list.
5. As a communicator, I want to see a log of missed calls and unreplied messages so that I can get back to people efficiently.
6. As a user, I want a "Clean Mode" UI so that I am not overwhelmed by visual clutter.
7. As a user, I want automatic email parsing for tasks so that I don't have to manually create tickets from my inbox.

## Implementation Decisions
- **Framework:** React Native (Expo recommended for rapid MVP).
- **Auth:** Google OAuth for Calendar/Gmail access.
- **Modules:**
    - `SyncEngine`: Modular handler for Google API polling.
    - `TaskStore`: Local-first database (SQLite or MMKV) for tasks.
    - `LifeDash`: The main high-aesthetic dashboard component.
    - `NotificationService`: Local push notification scheduling.
- **Aesthetics:** Minimalist, glassmorphism elements, dark mode primary.

## Testing Decisions
- **Unit Tests:** `SyncEngine` data transformation logic.
- **E2E Tests:** Playwright/Detox for manual task entry flow.
- **Behavior:** Test only external sync state, not internal API mock details.

## Out of Scope
- Native iOS Call Log access (restricted by Apple; will require manual "logged call" or manual entry for iOS).
- Desktop version (MVP is mobile-only).
- Heavy project management features (Jira/Linear sync).

## Further Notes
- Focus on "Micro-interactions" to make manual entry feel premium.
- Use `react-native-calendars` for high-performance date views.
