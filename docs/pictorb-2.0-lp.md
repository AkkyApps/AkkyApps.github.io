# PictOrb 2.0 and featured apps — 2026-11-04

## Sources and authorization

- Owner reported publication at 02:54 UTC and requested ongoing LP updates at 03:19 UTC. The subsequent instruction selects Prompter, Pアラーム and PictOrb as the main three apps. This authorizes this scoped LP publication; it does not authorize ASC changes or app source/release operations.
- Read Develop/AGENTS.md, SHARED.md, tools/delegation-preflight.md, promo-kit/SKILL.md, PROMO_PLAYBOOK lifecycle/LP sections and this repository README. Dedicated worktree and write claim; baseline `a9f7eedf24055e621ebebf80c87bacb0d59aaf45`, clean main, no other claims. Existing PictOrb branches and files were read only.
- ASC official API readback on 2026-11-04 around 03:23 UTC: app 6807662203, version `2.0.0` (`fadd3518-03f1-4b71-8e13-475b9c20a6b6`), READY_FOR_SALE / READY_FOR_DISTRIBUTION, downloadable; selected build `59` (`01c0052b-a9ad-4f46-b346-5341f413e18d`), VALID.
- Japan public Apple Lookup: https://itunes.apple.com/lookup?id=6807662203&country=jp returned 2.0.0 and `currentVersionReleaseDate=2026-11-03T21:04:34Z` (2026-11-04 JST). Japanese releaseNotes match the ASC Japanese whatsNew after trimming the trailing newline. News reproduces public releaseNotes exactly. A web search cache still showed 1.5.0 and was not used as current evidence.
- Build59 submission record: PictOrb `0ee487381bb12c14b01c2b726d23f8b832e6cdcf`, `fastlane/release-manifests/2.0.0+59.json` and `docs/release-2.0-preparation.md`. Candidate `0f65fc7` fixes version/build over accepted functional source `9b61429`. Implementation checked in `App/Features/Rendering/LensTypes.swift` (Original/Lens/Frame, Triangle Pixel Pro, Pixel OFF) and `App/Features/Camera/LensInteractionOverlay.swift` (Cube aspect ratio). No claim of new binary/device testing.
- Japan Lookup for Prompter 6762259685 (2.1.1) and Pアラーム 6800244742 (1.2.0) confirms existing descriptions/updates used in the featured section. Pアラーム display name follows its current Japanese store name; stable app ID remains palarm. The public PictOrb artwork visually matches the existing LP icon, which is retained.

## Scope and verification

- Main three in owner-specified order, equal-width desktop cards, single-column narrow layout. Pantry returns to the regular apps list. All ten apps remain present once.
- PictOrb version, featured/list copy and one News entry updated. Triangle Pixel remains explicitly Pro; no invented statistics or performance promises. Existing news, icons, app API catalog and other product pages unchanged. Portfolio-wide newsSource date retained because this was not a ten-app audit.
- `node scripts/build.mjs`, `node scripts/build.mjs --check`, `node scripts/check-app-catalog.mjs`: PASS (10 apps, 19 locales, 67 news entries).
- Internal browser at 375px and 1280px: no horizontal overflow (scrollWidth equals viewport), no broken images, ten cards, featured order verified. At 1280px all three featured cards measure 288px wide. Mobile News text and card layout visually checked.
- Local evidence (outside the public repository): `/Users/setup/Documents/Codex/2026-11-04/task/evidence/` contains readbacks and `lp-1280-featured.jpg`, `lp-375-featured.jpg`, `lp-375-news.jpg`. Raw authenticated API output is not committed.
- Publication will be checked separately after this preparation commit; this document does not assert a future push or deployment succeeded.
