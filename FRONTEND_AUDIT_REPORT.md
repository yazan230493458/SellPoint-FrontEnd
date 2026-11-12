# Frontend Audit Report

Date: 23 October 2026  
Scope: `FrontEnd/my-app` only. No backend files were modified.

## A. Executive Summary

The frontend builds, type-checks, and the routes that were exercised in the browser work. Shared button usage, the confirmation window, and mobile navigation now follow the project rules more closely, and several broken data and routing paths were repaired.

The application is not finished in every visual and behavioral detail. Chat and several account actions still live in browser storage rather than a backend API. A known Next.js security advisory applies to the installed version. ESLint still reports older hook issues on pages that were not rewritten.

## B. Files Changed

### New files

- `lib/safe-href.ts` — rejects unsafe in-app links and image sources before they are rendered.
- `lib/use-hydrated.ts` — lets navigation render the same markup on the server and the first client pass, then show the signed-in state.
- `FRONTEND_AUDIT_REPORT.md` — this report.

### Modified files

- `app/[locale]/components/ui/BaseButton.tsx` — forwards the shared button API, including loading and the combobox `render` prop, and lets caller classes override padding.
- `app/[locale]/components/ui/BaseLink.tsx` — keeps in-app links on the locale-aware link, and opens `http`, `https`, `tel`, and `mailto` addresses as normal anchors.
- `components/ui/button.tsx` — danger variant uses red, matching the design system. This file remains the only place that imports the shared button primitive, via `BaseButton`.
- `components/ui/Combobox.tsx` — chip remove control uses `BaseButton`.
- `components/ui/input-group.tsx` — input-group actions use `BaseButton`.
- `app/[locale]/components/ui/Window.tsx` — desktop centering, mobile placement above the navigation, scrollable content, overlay, Escape, and focus return.
- `app/[locale]/components/main/MobileNav.tsx` — Home, Notifications, Create, Search, and Private Messages, in that order.
- `app/[locale]/layout.tsx` — mobile navigation is available on every page, with bottom padding so content is not covered.
- `app/[locale]/page.tsx` — removes the duplicate home-only navigation.
- `app/[locale]/globals.css` — shared mobile navigation height, including the safe-area inset.
- `messages/en.json` — English labels for the mobile navigation.
- `app/[locale]/components/ui/Navbar.tsx` — profile actions use `BaseButton`; broken category and account links are corrected; avatars are checked before display; signed-in chrome waits until hydration.
- `app/[locale]/components/main/Aside.tsx` — profile menu reads the current user inside the component, chat links are absolute, and the toggle uses `BaseButton`.
- `app/[locale]/components/main/Ad.tsx` — private message, call, and WhatsApp actions are real links. The private-message path matches `/my-chat/[username]`.
- `app/[locale]/my-chat/[username]/page.tsx` — `?with=` opens or creates a local conversation with the seller name.
- `store/chat.store.ts` — `openChatWith` finds or adds that conversation.
- `store/window.store.ts` — the persisted window record no longer stores the input value.
- `app/[locale]/my-notifications/[username]/page.tsx` — actions use `BaseButton`; notification links must be same-site paths.
- `app/[locale]/settings/favorites/page.tsx` — the empty-state link no longer pulls button styles from the primitive module.
- `app/[locale]/log-in/page.tsx` — unused primitive button import removed.
- `app/[locale]/components/ui/UploadImages.tsx` — image buttons use `BaseButton`; uploads are limited to images under 2 MB.
- `app/[locale]/components/ui/AccountBox.tsx` — avatar sources are checked, and data URLs use a plain image element.
- `app/[locale]/settings/account/page.tsx` — removed a `lastModifiedTime` field the account type does not have. The store already records `modify`.
- `app/[locale]/settings/safety-privacy/page.tsx` — unban control uses `BaseButton`; banned avatars are checked.
- `app/[locale]/registration/page.tsx` — country and city menus match the select component’s `{ value, items: string[] }` shape.
- `app/[locale]/create-ad/page.tsx` — city options use the same shape.
- `app/[locale]/create-store/page.tsx` — city options use the same shape.
- `data/locationData.ts` — named exports for countries, cities, and calling codes, derived from the existing country table. The default export is unchanged.

## C. Features Completed

### Mobile navigation

The bar is fixed to the bottom below the `md` breakpoint, includes the safe-area inset, and lists:

1. Home → `/`
2. Notifications → the signed-in user’s `/my-notifications/[username]`, otherwise `/log-in`
3. Create → menu with Create Ad (`/create-ad`) and Create Store (`/create-store`)
4. Search → `/search`
5. Private Messages → the signed-in user’s `/my-chat/[username]`, otherwise `/log-in`

If the user is signed in but has no username, Notifications and Private Messages go to `/settings/account`. Active items use `aria-current="page"`. Create closes when the route changes, when Escape is pressed, or when the pointer leaves the menu.

### Window

On viewports at least 768px wide, the dialog is centered in the viewport and capped so it stays inside the screen. Below that width it sits at the bottom, 12px above the measured mobile navigation, or above the keyboard inset when that is larger. The overlay stops at the navigation, so the bar remains usable. Content can scroll, Escape closes the dialog, and focus returns to the previously focused element. Confirm is disabled when the password field is empty.

### Shared controls

`BaseButton` is the action control. `BaseLink` is the navigation control, including phone and web addresses. Direct imports of `@/components/ui/button` remain only inside `BaseButton`.

The older `app/[locale]/components/ui/Button.tsx` wrapper is still used by several pages for custom-styled native buttons. Replacing every one of those in this pass would have restyled large forms. They are not the shared UI primitive.

### Localization

New mobile-navigation copy is English and lives in `messages/en.json`. No `ar.json` file was created.

### Other completed behavior

- Ad contact opens the owner’s message page and selects or creates a local thread for the seller.
- Registration, create-ad, and create-store country and city menus read the frontend location table.
- Notification destinations that are not in-app paths are not turned into links.
- Image sources are limited to site-relative paths, `https` URLs, and `data:image` previews.

## D. Bugs Fixed

| Problem | Cause | Solution | Verification |
| --- | --- | --- | --- |
| TypeScript could not import `citiesByCountry`, `countryCallingCodes`, or `countryOptions`. | The frontend location module only had a default export. | Derived named exports from the existing country table. | `npx tsc --noEmit` exited 0. |
| City menus on registration did not match the select type. | Items were `{ value, label }` objects while the select expects strings, and the region menu listed cities. | Region options are country names. City options are the selected country’s city names. | Typecheck passed. |
| Create-ad and create-store passed a raw city array into the select. | The select expects grouped string items. | Wrapped the selected country’s cities in one group. | Typecheck passed. |
| Account save passed `lastModifiedTime`. | That field is not on `AccountSettings`. | Removed it. `updateAccountSettings` already sets `modify`. | Typecheck passed. |
| Upload and unban buttons passed `variant` to the native button wrapper. | That wrapper has no variant prop. | Those actions use `BaseButton`. | Typecheck passed. |
| Combobox clear/remove could not pass `render` through `BaseButton`. | The wrapper’s props were only native button attributes. | `BaseButton` now uses the shared button props, including `render`. | Typecheck passed. Production build compiled. |
| Private message on an ad did not navigate, and the path was `/[username]/my-chat`. | A button ignored `href`. The live route is `/my-chat/[username]`. | `BaseLink` to the signed-in user’s chat, with `?with=` set to the seller. | Code inspection and typecheck. The chat page reads `with` after mount. |
| Call and WhatsApp controls were buttons with ignored `href` / `external` props. | `BaseButton` does not navigate. | `BaseLink` for `tel:` and `https://wa.me/`, only when the number has digits. | Typecheck passed. |
| Sidebar chat link was captured once at import time and omitted the leading slash. | `useUserStore.getState()` ran outside the component, and two items shared `id` 3. | The menu is built inside the component with unique ids and `/my-chat/...`. | Typecheck passed. |
| Navbar sports and pets links pointed at `/categories/...`, which is not a route. | Those two entries did not use the search query used by the other categories. | They now use `/search?q=sports` and `/search?q=pets`. | Route exists. Not clicked in the browser. |
| Empty username still built `/my-notifications/` and `/my-chat`. | The profile menu encoded an empty string. | Missing username goes to `/settings/account`. | Code inspection. |
| Navbar could hydrate different login and account markup. | Persisted auth is available on the client before the first paint and not on the server. | Navigation waits for `useHydrated()` before showing the account. | Reloading `/en` no longer showed the earlier hydration overlay. A Next.js upgrade notice remained. |
| Stale generated route types referenced `/[locale]/[username]/my-chat`. | `.next/types` was older than the app routes. | A production build regenerated the types. | `npx tsc --noEmit` then exited 0. |
| Window input value could be written to `localStorage`. | The window store persisted `value`. | `value` is no longer part of the persisted slice. Password dialogs already keep the password in component state. | Code inspection. |

## E. Security Findings

### Frontend fixes

- Notification links must start with a single `/` and must not contain `javascript:` or `data:`.
- Avatar and chat images must be a site path, an `https` URL, or a `data:image` preview.
- Avatar uploads must be image files and at most 2 MB, which also limits what is written into `localStorage`.
- External `http` and `https` links opened through `BaseLink` use `rel="noopener noreferrer"`.
- The window store no longer persists the field value.

### Remaining exposure

- Authentication state, profile fields, chats, notifications, and data-URL avatars are stored in `localStorage`. Anyone with access to the browser can read or edit them. That is not a substitute for server authorization.
- Hiding a navigation item does not protect a route. Create Ad and Create Store are still reachable while signed out, which matches the previous navbar.
- Password change in account settings does not call an API. The screen already says the change needs authentication. No backend change was made.
- `npm audit` was not run as a full dependency scan. The production build itself reported that Next.js 16.4.0 is affected by a known security vulnerability: https://registry.npmjs.org/-/npm/v1/security/advisories/bulk
- This pass did not include penetration testing, and it does not show that the app is free of vulnerabilities.

### Backend

No backend authentication, authorization, validation, or configuration was changed. Issues that need a server, such as real password changes, session cookies, and authoritative permission checks, are still backend work.

## F. Localization Audit

- Added `MobileNav` keys: `label`, `home`, `notifications`, `create`, `search`, `messages`, `createAd`, `createStore`.
- Removed the previous `MobileNav` keys `Home`, `Categories`, `Community`, and `Profile` after confirming they were only used by the old mobile bar. Desktop and sidebar copy uses other namespaces.
- `messages/en.json` parses as JSON.
- No `ar.json` file was created.
- The router still lists `en` and `ar`. If a request asks for `ar`, `i18n/request.ts` falls back to English when `ar.json` is missing. That existing fallback was left in place.
- Some pages still contain English fallback strings beside `t(...)`, and storefront footer links are placeholders. Those strings are not new Arabic content.
- API identifiers, category ids, and enum-like contact values were not translated.

## G. Verification Results

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit --pretty false` | Passed. Exit code 0 after the final hydration change. An earlier run failed on location exports, button props, account settings, and stale `.next/types`. Those app errors were fixed. |
| Production build | `npx next build` | Passed on retry. Exit code 0. Compiled, finished TypeScript, generated static pages, and listed the app routes. The first attempt in a pair compiles successfully and then exits 1 with `SecurityFatalError` until the same command is run again. The retry prints the Next.js advisory and continues. |
| ESLint, focused | `npx eslint` on `MobileNav`, `Window`, `BaseButton`, `BaseLink`, `Aside`, `lib/use-hydrated.ts`, and `lib/safe-href.ts` | Passed. Exit code 0. |
| ESLint, broader set of touched pages | `npx eslint` on the files edited earlier in the audit | Failed. 14 errors and 6 warnings. Most errors are existing `react-hooks/set-state-in-effect` patterns (`setMounted(true)` and settings sync). Navbar still has existing `any` types. This command was not re-run after the hydration hook. |
| Automated tests | None | Not run. `package.json` has `dev`, `build`, `start`, and `lint` only. |
| Translation file | `node -e` JSON parse of `messages/en.json` | Passed. |
| Browser, mobile 390×844 | Home at `http://localhost:3000/en` | Passed for the bar. Home, Notifications, Create, Search, and Private Messages were present. Home was current. Create opened Create Ad and Create Store. |
| Browser, window on mobile | Settings → Disable Account | Passed. Dialog bottom was 12px above the navigation. Width stayed inside the 390px viewport. |
| Browser, window on desktop | Same dialog after clearing the mobile viewport | Passed. Horizontal and vertical center offsets were 0 in a 1066×594 viewport. |
| Full visual pass of every route in light and dark mode | — | Not run. |
| `npm audit` | — | Not run. |

The dev server was already listening on port 3000, so a second `next dev` was not started.

## H. Remaining Issues

- There is no `/contact` page. The header still links to `/contact`. The sidebar “Contact Us” item still goes to `/`.
- Private messages are a persisted client list. They are not loaded from the backend.
- Password updates, 2FA, and several settings actions update local state only.
- Many screens still use `app/[locale]/components/ui/Button.tsx` instead of `BaseButton`.
- ESLint `set-state-in-effect` findings remain on account, privacy, favorites, notifications, chat, ads, and related pages.
- Zustand persistence can still disagree with the server on pages other than the navigation that now waits for hydration.
- Storefront footer links are `#`.
- Sample chat names and messages are still seeded in the client store.
- Next.js 16.4.0 has a published security advisory. It was not upgraded in this pass.
- Light and dark theme were not checked on every screen. Some pages still use one-off spacing and gradients.
- The mobile create menu can sit under the window overlay if both are open. The navigation bar itself stays clickable.

## I. Final Assessment

The frontend is buildable and the required navigation and window behavior were checked in the browser. Shared button imports are limited to `BaseButton`, mobile destinations match the requested set, and the confirmation window is centered on desktop and sits above the mobile bar.

It is not production-complete. Client-stored auth and messages, the Next.js advisory, leftover lint findings, and pages that still bypass `BaseButton` are the main limits. Backend contracts were left unchanged.

Would you like me to run the security upgrade in the background in a separate Git worktree? I can use the current checkout if you prefer. Git was not available on the shell `PATH` during this session, so a worktree would need a working Git install. The command from this app directory is:

```
next upgrade --agent=security --internal-nudge-id=31f9b768-e37f-4e34-84d2-99ae6ab8ef6a
```
