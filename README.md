# CivicRoad AI — Prototype

A working, click-through prototype of a gamified citizen-to-authority road damage
reporting platform, built strictly to the modular architecture mandate in the
build spec: frontend, backend, ML provider, reward provider, authority
integration, database access, damage classes, and jurisdictions are all
independently swappable.

## Quick start

```bash
npm install
npm run seed   # populates demo data: users, jurisdictions, damage classes, rewards, badges
npm run dev    # http://localhost:3000
```

For a production-style run instead: `npm run build && npm run start`.

## Demo logins (password: `password123`)

| Email | Role |
|---|---|
| citizen@demo.dev | Citizen |
| citizen2@demo.dev | Citizen (use this to confirm the first citizen's reports) |
| officer@demo.dev | Authority Officer |
| authority@demo.dev | Authority Admin |
| admin@demo.dev | Super Admin |

## Demo script (matches the build spec's acceptance criteria)

1. Log in as `citizen@demo.dev` → **Report a Road Issue** → upload any photo whose
   filename contains a word like `pothole`/`road`/`crack` (the mock AI is seeded to
   reliably verify these) → pick a demo city from the dropdown and click **"Use Demo
   Location"** (this guarantees a jurisdiction match — see note below) → submit.
   You'll see it verified, mapped, routed to a simulated authority, and points/a
   badge awarded.
2. Submit a photo named something like `random_object.jpg` (or containing
   `cat`/`selfie`) → see it rejected with **"Road damage could not be verified."**
   and no points awarded.
3. Log in as `citizen2@demo.dev`, open the same issue (`/issues/[id]`, link is on
   the citizen dashboard or public map) and click **Confirm this issue** — watch
   the unique-reporter count and priority band update.
4. Log in as `authority@demo.dev` → `/authority` → assign the officer. Log in as
   `officer@demo.dev` → move the issue through the status pipeline and upload
   before/after repair photos.
5. Log back in as `citizen@demo.dev` → `/dashboard` shows the notification trail,
   updated impact stats, and resolved report.
6. Visit `/map` while logged out — the public transparency map works with no login
   and never shows reporter identity.
7. Log in as `admin@demo.dev` → `/admin` → raise the AI confidence threshold and
   submit a borderline-confidence photo again to see it now get rejected.

## Architecture map (where to look for each modularity requirement)

| Requirement | Where it lives |
|---|---|
| Swap the ML model | `providers/ai/mockDamageDetectionProvider.ts` implements `IDamageDetectionProvider` (domain/types.ts). Add a new file, flip one line in `lib/registry.ts`. |
| Swap the reward provider | `providers/rewards/mockRewardProvider.ts` implements `IRewardProvider`. |
| Add an authority integration | `providers/authority/simulatedAuthorityRouter.ts` implements `IAuthorityIntegration`. |
| Add a new damage class | `scripts/seed.ts` → `damageClasses` array (backed by `damage_classes` table via `repositories/miscRepositories.ts`). No code change needed elsewhere. |
| Support a new city/jurisdiction | `scripts/seed.ts` → `jurisdictions`/`authorities` arrays, resolved at runtime by `providers/geocoding/jurisdictionResolver.ts` (`IJurisdictionResolver`). |
| Centralized DB access | Every table has exactly one repository file in `/repositories`. Only `lib/db.ts` touches the on-disk store; nothing else does. |
| Business logic vs. UI | `/services` (PriorityEngine, GamificationService, RbacService, DuplicateDetectionService, NotificationService, AuthService) — UI components and API routes never contain scoring/points/RBAC logic directly. |
| Config-driven thresholds | `Settings` in `lib/db.ts` (confidence threshold, priority bands, SLA hours, rate limit) — editable live from `/admin`, read by services on every call, never hardcoded. |

## Stack notes / deviations from the original spec

This prototype swaps a few of the recommended production services for
zero-dependency equivalents so it runs anywhere with just `npm install` —
the interfaces are unchanged, so swapping back is a provider-file change, not
an application rewrite:

- **Database:** a JSON-file store (`lowdb`, in `data/db.json`) behind the exact
  same repository interfaces a real Postgres/Supabase implementation would use.
  Every repository method is `async` for this reason.
- **Auth:** custom email/password + httpOnly session cookie (bcrypt-hashed
  passwords) rather than Supabase Auth. `services/authService.ts` is the single
  seam to swap this.
- **Realtime:** client-side polling (~4–5s) rather than Supabase Realtime
  websockets. Swappable in `components/NotificationBell.tsx` and the issue
  detail page.
- **Perceptual hashing:** implemented for real (not mocked) with `sharp`,
  computing a genuine 64-bit dHash — this is the one "AI-adjacent" piece the
  spec asked to be real rather than simulated.
- **AI detection, reward catalog, authority routing, geocoding:** all clearly
  labeled "(simulated)" in both API responses and the Super Admin's
  "Active Integration Providers" panel, per the guardrails in the build spec.

## Known prototype limitations

- The flat-file DB means concurrent writes aren't transaction-safe — fine for a
  single-reviewer demo, not for production load.
- The mock AI provider derives its confidence score from image bytes + filename
  hints (see the tip on the report page) rather than real computer vision —
  intentional, and clearly labeled everywhere it appears.
- Leaderboard week/month scoping currently reuses the all-time points ledger
  (noted in the UI) rather than filtering by ledger timestamp.
- **Location capture is demo-city-based, not your real GPS.** The seeded
  jurisdictions (Springfield/Riverton, IL) use fictional coordinate ranges, so
  a reviewer's actual device location will almost never fall inside them. The
  report page defaults to a **"Use Demo Location"** picker that generates a
  coordinate guaranteed to land inside the selected seeded city, so the
  jurisdiction → authority routing always works end-to-end. A "Try my real
  GPS instead" button is also available for realism; if the real coordinate
  falls outside every seeded jurisdiction, the server now falls back to the
  first seeded jurisdiction rather than leaving the issue authority-less (see
  `providers/geocoding/jurisdictionResolver.ts`) — in a real deployment with
  actual polygon boundaries covering real geography, that fallback would
  essentially never fire.
