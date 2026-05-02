# DESIGN.md — CarbonTrace (EcoTrace)

## Overview

**Product:** CarbonTrace is a blockchain-backed, AI-verified eco-activity tracking platform that lets individuals log, prove, and earn carbon credits for verifiable pro-environmental actions — public transit use, EV charging, tree planting, and more.

**Users:**
- **Citizens / End Users** — log daily sustainable activities, upload evidence, track their carbon credit balance and footprint history.
- **Sponsors / Companies** — monitor aggregated sustainability data and distribute incentive credits to verified users.
- **Administrators** — review flagged submissions, manage users, audit system health, and resolve disputes.

**Goals:**
- Make individual climate action measurable and tamper-proof via blockchain.
- Reduce fraud through AI-based image verification and OCR evidence analysis.
- Provide a compelling, gamified experience that rewards consistent eco behavior.
- Enable organizations to build incentive programs on top of verifiable individual records.

**Tech Stack (reference):**
- Frontend: Next.js (web), Flutter (mobile future)
- Backend: FastAPI (Python)
- AI/ML: PyTorch — deep learning image verification + OCR
- Blockchain: Solidity smart contracts on Ethereum
- Database: PostgreSQL
- Infra: Docker + Cloud (K8s-ready)

---

## Design Language

| Token | Value |
|---|---|
| Primary green | `#1D9E75` |
| Deep green | `#0F6E56` |
| Mint highlight | `#A8F0D8` |
| Background | `#F4F6F3` (warm gray) |
| Dark panel | `#111C18` |
| Card border | `rgba(255,255,255,0.08)` — glass |
| Border radius | 24–34px (cards), 12px (chips/badges) |
| Font — display | Inter or similar variable, bold headers |
| Font — mono labels | JetBrains Mono for stats, timestamps, hashes |
| Blur/Glass | `backdrop-filter: blur(12px)` on overlaid cards |
| Shadow | Soft ambient, no harsh drop-shadows |

Dark mode-first. Light sections (activity history, advisory) use `#F8FAF9` with mint-tinted borders.

---

## Screens

### 1. Landing / Marketing (`/`)
### 2. Register (`/register`)
### 3. Login (`/login`)
### 4. Dashboard — Overview (`/dashboard`)
### 5. Submit Activity (`/submit`)
### 6. Activity History & Verification Pipeline (`/history`)
### 7. Carbon Credit Wallet (`/wallet`)
### 8. Leaderboard (`/leaderboard`)
### 9. Profile & Settings (`/settings`)
### 10. Admin Panel (`/admin`)
### 11. Sponsor Portal (`/sponsor`)

---

## Screen Details

### 1. Landing / Marketing (`/`)

**Purpose:** Convert visitors to registered users; communicate trust and impact.

**Sections:**
- Navbar: logo chip, tagline "Climate actions, tracked clearly", Login / Register CTA
- Hero: animated carbon counter ticking up globally, headline, "Start Tracking" CTA
- How It Works: 3-step visual — Log → Verify → Earn
- Activity types showcase: transit, EV, tree planting, recycling cards with credit values
- Trust signals: "Verified on-chain", anomaly detection badge, sponsor logos
- Footer: links, legal

---

### 2. Register (`/register`)

**Purpose:** Onboard a new citizen user.

**Fields:**
- Full name
- Email
- Password + confirm
- Location (city, used for transit/EV verification context)
- Optional: wallet address for credit redemption

**Behavior:**
- Email verification step before full access
- Terms of service acknowledgment (carbon credit program rules)
- After verification → redirect to Dashboard with onboarding checklist

---

### 3. Login (`/login`)

**Purpose:** Authenticated re-entry.

**Fields:** Email, password, "Remember me"

**Features:**
- OAuth option (Google)
- Forgot password flow
- Post-login → Dashboard

---

### 4. Dashboard — Overview (`/dashboard`)

**Purpose:** The primary daily-use screen. Shows personal impact at a glance.

**Layout (dark full-bleed panel):**

**Navbar strip** (translucent, sticky):
- Logo chip `CT`
- Tagline
- `Dashboard` active link, `History`, `Wallet`, `Leaderboard`
- `Submit Activity` primary CTA button (forest green)
- Avatar/profile dropdown

**Hero section:**
- Large carbon offset number: `247.3 kg CO₂` — month total
- Sub-label: "Total carbon offset this month across verified individual actions"
- `● Chain synced` status pill (green dot, mono font, top-right)

**Stats strip (4 tiles):**

| Tile | Primary Value | Sub-label |
|---|---|---|
| Credits Earned | `1,842` | `+128 today` |
| Submissions | `34` | `3 pending` |
| Verify Rate | `91%` | `+2% vs last month` |
| Flagged | `2` | `Needs review` |

**Middle two-column section:**
- Left: `Offset Activity · Last 14 Days` — bar chart, `+17% TREND` badge, summary insight text (e.g., "Momentum is strongest on verified commute and charging days.")
- Right: `Credit Balance` card — `1,842` large, `Available This Cycle: +128 credits`, advisory blurb, `Submit evidence` CTA button

**Recent Activity list (bottom of dark panel):**
4 cards in 2×2 grid, each with:
- Icon chip (activity category icon, teal bg)
- Activity name + date/time
- Status badge: `PENDING` (amber), `VERIFIED` (green), `FLAGGED` (red)
- Credit delta: `+18`, `+55`, `+30`

**State variations:**
- Empty state: no submissions yet → illustrated prompt + "Log Your First Activity"
- Flagged state: red banner nudge to resolve before cycle close
- Chain sync error: amber pill replacing green, "Sync delayed" tooltip

---

### 5. Submit Activity (`/submit`)

**Purpose:** Core conversion action — user proves an eco activity happened.

**Step flow (multi-step form, step indicator at top):**

**Step 1 — Choose Activity Type:**
- Card grid: Public Transit, EV Charging, Tree Planting, Recycling, Carpooling, Renewable Energy, Walking/Cycling, Other
- Each card: category icon, name, estimated credit range (e.g., `+15–25 credits`)

**Step 2 — Upload Evidence:**
- Drag-and-drop upload zone (image, PDF receipt)
- Camera capture button (mobile)
- Supported formats: JPG, PNG, PDF
- Preview thumbnail once uploaded
- Helper text: "Upload within 4 hours for faster verification"

**Step 3 — Add Metadata:**
- Date & time picker (defaults to now)
- Location (auto-detected or manual)
- Activity-specific fields:
  - Transit: route / operator / ticket number
  - EV: kWh charged, charging station ID
  - Tree planting: number of saplings, location pin
  - Recycling: material type, weight estimate

**Step 4 — Review & Submit:**
- Summary card: activity type, evidence thumbnail, metadata
- Estimated credits shown
- `Submit for Verification` button
- Terms reminder: fraudulent submissions may result in account suspension

**Post-submit state:**
- Success toast: "Submitted — AI verification in progress"
- Redirect to History with submission marked `PENDING`

---

### 6. Activity History & Verification Pipeline (`/history`)

**Purpose:** Full audit trail of all submissions with their verification status.

**Layout (split — light background):**

**Left panel — Verification Pipeline / Activity History:**
- Section header: `VERIFICATION PIPELINE`
- Title: `Activity history`
- `Export` button (CSV download)
- Scrollable list, each item:
  - Icon chip (category)
  - Activity name + timestamp
  - Credit delta (`+18`, `+55`, etc.)
  - Status badge on hover/detail expand
- Pagination or infinite scroll

**Right panel — Advisory:**
- Section header: `ADVISORY`
- Title: `What to improve next`
- Dynamic tip cards (3 max), e.g.:
  - "Upload evidence within 4 hours for better verification speed."
  - "Bundle recurring transit rides into a weekly claim."
  - "Resolve the two flagged activities before month close."

**Filters (top bar):**
- Status filter: All / Verified / Pending / Flagged
- Activity type filter
- Date range picker

**Detail drawer (slide-in on row click):**
- Full evidence image preview
- OCR-extracted text summary
- Verification confidence score (e.g., `94% match`)
- Blockchain transaction hash (mono font, copyable)
- Timeline: Submitted → AI Processing → Verified → On-chain

---

### 7. Carbon Credit Wallet (`/wallet`)

**Purpose:** Financial view of earned credits and redemption options.

**Sections:**

**Balance card:**
- Total credits: large number
- Available / Locked / Redeemed breakdown
- Mini bar showing cycle progress

**Transaction ledger:**
- Tabular list: date, activity, credits, status, tx hash
- Filterable by date range

**Redemption panel:**
- Connected sponsor offers (e.g., "Redeem 500 credits for ₹200 transit voucher")
- Redeem CTA per offer
- Redemption history

**Blockchain verification:**
- "View on Explorer" link per credit batch
- Wallet address display (if connected)

---

### 8. Leaderboard (`/leaderboard`)

**Purpose:** Social proof and gamification to drive engagement.

**Sections:**

**Top 3 podium (visual):**
- Avatar, name (anonymized option), total kg CO₂ offset this month, credits earned

**Full ranked table:**
- Rank, avatar, display name, activities this month, total offset, credits
- User's own rank highlighted

**Filters:**
- Scope: Global / City / Friends
- Period: This Month / All Time

**My rank card (sticky bottom or top):**
- "You are #47 globally this month — top 12%"

---

### 9. Profile & Settings (`/settings`)

**Sections:**

**Profile:**
- Avatar upload
- Display name, email, location
- Bio / organization (optional)

**Notification preferences:**
- Verification complete alerts
- Flagged submission alerts
- Weekly impact digest
- Credit cycle reminders

**Privacy:**
- Show on leaderboard toggle
- Anonymize display name on leaderboard
- Data export (GDPR)

**Connected wallet:**
- Ethereum wallet address for credit redemption
- Connect / disconnect

**Account:**
- Change password
- Delete account

---

### 10. Admin Panel (`/admin`)

**Purpose:** Internal ops for administrators — moderation, system health, user management, and provider vetting.

**Sections:**

**Summary bar:**
- Active users today, submissions today, pending review count, flagged count, chain sync status
- **+ Provider applications pending:** count badge (red if > 0)

---

**Provider Application Review (`/admin/providers`)**

This is the gate before any API key is ever generated. No provider gets a key without passing through this queue and being manually approved by an admin.

**Application queue table:**

| Column | Detail |
|---|---|
| Organization name | Submitted name |
| Type | Transit / EV / Tree Nursery / Recycling / Other |
| Region | Country + operating area |
| Applied on | Date |
| Contact email | Official company email (used for all admin correspondence) |
| Status | `PENDING` / `UNDER REVIEW` / `APPROVED` / `REJECTED` |
| Action | `Review` button |

**Status badge colors:**
- `PENDING` — amber (not yet opened by any admin)
- `UNDER REVIEW` — blue (an admin has opened it and is actively working it)
- `APPROVED` — green
- `REJECTED` — red

**Application detail drawer (opens on `Review`):**

Full side panel or dedicated page `/admin/providers/{application_id}`:

- **Organization info:** name, type, website, registered region, expected monthly volume
- **Contact person:** name, designation, email address
- **Official company email:** separate field — this is the address admin uses to correspond and the one that receives the API key on approval. Must be a corporate domain (not gmail/yahoo etc. — flagged if personal domain)
- **Uploaded documents section:**
  - Business registration certificate / incorporation document
  - Government-issued ID of the authorized representative (person signing the integration agreement)
  - Proof of sustainable operations (e.g. transit operator license, EV network certification, nursery registration)
  - Each document: filename, upload date, `View` button (opens in modal/new tab), `Download` button
  - Document status chips: `Unreviewed` / `Looks valid` / `Needs clarification` — admin can mark each doc individually
- **Admin notes field:** internal-only text area for the reviewing admin to leave notes (visible to other admins, never to applicant)
- **Activity types requested:** what the provider said they want to report (e.g. `ev_charge`, `bus_ride`)
- **Credit rate config (pre-fill):** admin sets the credit value per activity unit before approval — e.g. `EV Charge: 1.3 credits/kWh`, `Bus Ride: 18 credits/trip`. These values are locked into the provider's API scope on approval.

**Admin action bar (bottom of detail panel):**

- `Send Email` — opens a compose modal pre-filled with the applicant's company email, subject line auto-set to "CarbonTrace Provider Application — [Org Name]". Admin writes body freely. Email is sent from the platform's verified sender (`providers@carbontrace.io`). All sent emails are logged in the application timeline.
- `Mark Under Review` — claims the application (assigns it to the current admin, changes status to `UNDER REVIEW`, prevents another admin from duplicating work)
- `Request Documents` — shortcut that opens the email compose modal with a pre-written template asking for specific missing documents
- `Approve` — only enabled when:
  - At least one admin has marked all uploaded documents as `Looks valid`
  - Credit rates have been configured
  - Company email is set
  - Triggers: API key generation (server-side, never stored in plaintext after initial send), welcome email to company email with key, application status → `APPROVED`
- `Reject` — opens a modal with a required reason field. Rejection reason is included in the automated rejection email sent to company email. Status → `REJECTED`. Reapplication possible after 30 days.

**Application timeline (right side of detail view or below):**

Chronological log of every event on this application:
- "Application submitted — Apr 28, 2025 14:32"
- "Opened by admin@carbontrace.io — Apr 29, 2025 09:11"
- "Marked Under Review — Apr 29, 2025 09:11"
- "Email sent: 'Please provide operator license' — Apr 29, 2025 09:45"
- "Document 'operator_license.pdf' uploaded by applicant — Apr 29, 2025 16:20"
- "Document marked 'Looks valid' — Apr 30, 2025 10:00"
- "Approved by admin@carbontrace.io — Apr 30, 2025 10:05"
- "API key issued and emailed to ops@transitco.in — Apr 30, 2025 10:05"

**Active providers tab (`/admin/providers/active`):**

Separate tab from the application queue — shows all approved, live providers:

| Column | Detail |
|---|---|
| Org name | — |
| Type | — |
| Company email | — |
| API key (masked) | `sk_live_••••••••` |
| Status | `ACTIVE` / `SUSPENDED` / `REVOKED` |
| Tokens issued (month) | — |
| Tokens claimed (month) | — |
| Last API call | timestamp |
| Actions | `View`, `Suspend`, `Revoke Key`, `Email` |

- `Suspend` — temporarily disables the API key (all new token requests return 403). Provider is emailed automatically. Reversible.
- `Revoke Key` — permanently invalidates the key. Requires admin to enter a reason. Provider emailed. They must reapply for a new key.
- `Email` — same compose modal, pre-filled with provider's company email

---

**Flagged Submissions queue:**
- Table: user, activity, submission date, flag reason, evidence thumbnail
- Actions: Approve / Reject / Request more info
- Bulk actions

**User management:**
- Search / filter users
- View user profile, submission history
- Suspend / unsuspend account

**System health:**
- AI verification queue depth
- Blockchain node sync status
- API response time graph
- Recent error logs

**Audit log:**
- All admin actions logged with timestamp — includes all provider approval/rejection/suspension events

---

### 11. Sponsor Portal (`/sponsor`)

**Purpose:** B2B view for company sponsors to monitor program health and distribute credits.

**Sections:**

**Program overview:**
- Total credits distributed, active participants, avg CO₂ offset per user
- Budget remaining this cycle

**Credit distribution:**
- Set credit rate per activity type
- One-time bulk grants to verified users
- Scheduled distributions

**Aggregated impact report:**
- Total kg CO₂ offset across all enrolled users
- Activity type breakdown chart
- Downloadable PDF report for ESG reporting

**User roster:**
- List of enrolled users (anonymized if opted out), their verified activity count, credits earned
- Export CSV

---

## Components

### Navigation
- **Navbar** — sticky, translucent dark glass on scroll; logo chip, nav links, avatar dropdown, `Submit Activity` CTA
- **Sidebar** (admin/sponsor) — collapsible, icon + label, active state highlight
- **MobileDrawer** — hamburger → slide-in full nav on mobile

### Data Display
- **StatTile** — icon, large number, label, delta sub-label (used in dashboard strip)
- **ActivityCard** — icon chip, title, timestamp, status badge, credit delta; `PENDING` / `VERIFIED` / `FLAGGED` variants
- **BarChart14Days** — 14-bar chart, hover tooltip, trend badge overlay
- **CreditBalanceCard** — balance number, cycle info, advisory blurb, CTA button
- **LeaderboardRow** — rank number, avatar, name, stats, highlight for self
- **PodiumBlock** — top-3 visual with medal styling

### Form & Input
- **ActivityTypeGrid** — card grid with icon, name, credit range; selection highlight
- **EvidenceUploader** — drag-drop zone, camera capture, thumbnail preview, file format hint
- **MetadataFields** — dynamic field set per activity type (date picker, location, number input, text)
- **StepIndicator** — numbered steps, active/complete/pending states

### Feedback & Status
- **StatusBadge** — `PENDING` (amber), `VERIFIED` (green), `FLAGGED` (red), `PROCESSING` (blue) — pill shape
- **ChainSyncPill** — `● Chain synced` / `● Sync delayed` — mono font, color-coded dot
- **ToastNotification** — success / error / warning — bottom-right, auto-dismiss 4s
- **VerificationTimeline** — horizontal step tracker: Submitted → AI Processing → Verified → On-chain

### Cards & Panels
- **DarkPanel** — `#111C18` background, glass border, 28px radius — used for hero/dashboard sections
- **LightCard** — `#F8FAF9` with mint border, 24px radius — used for history/advisory sections
- **AdvisoryTipCard** — mint-tinted background, single tip line, subtle left accent bar
- **DetailDrawer** — slide-in right panel, evidence image, OCR output, tx hash, timeline

### Blockchain
- **TxHashChip** — copyable mono hash, truncated with ellipsis, "View on Explorer" link
- **BlockchainStatusIndicator** — sync status, block number, last commit time

### Wallet & Credits
- **CreditBreakdownBar** — available / locked / redeemed segments, labeled
- **RedemptionOfferCard** — sponsor logo, offer description, credit cost, redeem CTA
- **WalletAddressChip** — truncated address, connect/disconnect toggle

---

## User Flows

### Core Flow — Submit & Verify
```
Login → Dashboard → Submit Activity (CTA)
  → Pick Activity Type
  → Upload Evidence
  → Fill Metadata
  → Review & Submit
  → Pending in History
  → AI processes (async)
  → Verified / Flagged notification
  → On-chain commit
  → Credits added to wallet
  → Dashboard updates
```

### Flagged Submission Resolution
```
Dashboard → "2 Flagged – Needs review" tile
  → History (Flagged filter)
  → Detail Drawer → see flag reason
  → Re-upload evidence or dispute
  → Admin reviews → Approve / Reject
```

### Credit Redemption
```
Wallet → View available credits
  → Browse sponsor offers
  → Redeem → confirm dialog
  → Redemption logged on-chain
  → Voucher / reward delivered via email
```

---

## Accessibility & Responsive Notes

- All status colors (green/amber/red badges) also carry text labels — never color-only
- Dark panel sections: minimum 4.5:1 contrast ratio for body text
- Evidence uploader: keyboard-accessible, screen-reader label on drop zone
- Mobile breakpoints: navbar collapses to drawer at `< 768px`; stat strip stacks 2×2; activity cards go single column
- Touch targets: minimum 44×44px for all interactive elements

---

## Future Screens (v2 scope)

> **Impact Map** (geolocated activity heatmap) — deferred, on hold.

---

### V2-A: Verified Provider API Platform

#### Concept

Instead of users uploading evidence manually, registered **Sustainable Activity Providers** (transit operators, EV charging networks, certified tree nurseries, recycling facilities) integrate directly with CarbonTrace via a server-to-server API. When a real activity completes on their end, they call the CarbonTrace API, which issues a **short-lived signed activity token**. That token is encoded as a QR code and shown to the user (on a terminal screen, receipt, or the provider's own app). The user scans it in CarbonTrace — instant, zero-evidence-upload, high-confidence credit.

**Trust model:** The QR is not user-generated. It is server-issued by CarbonTrace in response to a validated API call from a credentialed provider. The user just claims it. Fraud surface is the provider API key, not the user.

---

#### Provider API Flow (end-to-end)

```
Provider system detects activity completion
  → POST /api/v1/provider/activity  (signed with API key)
  → CarbonTrace backend validates:
      - API key authenticity + active status
      - Activity payload schema (type, metadata, timestamp)
      - Rate limits & duplicate check
  → Issues ActivityToken (JWT, signed with platform private key)
      - Contains: activity_type, provider_id, credits_value,
                  user_hint (optional), expires_at (15 min TTL)
  → Returns: { token: "<JWT>", qr_payload: "<base64>" }

Provider renders QR on terminal / receipt / their app
  ↓
User opens CarbonTrace app → "Scan QR" button
  → App decodes QR → extracts JWT
  → POST /api/v1/user/claim  { token: "<JWT>", user_id }
  → Backend verifies JWT signature + expiry + not-yet-claimed
  → Marks token as consumed (one-time use)
  → Creates verified activity record
  → Commits to blockchain via smart contract
  → Credits added to user wallet immediately
  → Push notification: "✓ +55 credits — EV Charge verified"
```

**Token security properties:**
- RS256 signed JWT (platform holds private key; providers cannot forge)
- `exp` claim: 15-minute TTL — expired QR → rejected
- `jti` claim: unique token ID stored in Redis — replayed QR → rejected
- `provider_id` embedded — all credits traceable to issuing provider
- Optional `user_hint` (partial email hash) — provider can pre-bind to a known user, adds an extra claim step if mismatched

---

#### Screen: Provider Registration Portal (`/provider/register`)

**Purpose:** Onboard a new Sustainable Activity Provider organization.

**Sections:**

**Application form:**
- Organization name, type (Transit / EV Network / Tree Nursery / Recycling / Other)
- Country & operating region
- Website + business registration document upload
- Contact person details
- Brief description of the sustainable activity type they will be reporting
- Expected monthly activity volume (used for rate limit tiers)

**Review states:**
- `PENDING REVIEW` — submitted, under admin evaluation (3–5 business days)
- `APPROVED` — receives API key and onboarding guide
- `REJECTED` — reason given, reapplication allowed after 30 days

**Post-approval:**
- Welcome email with API key (shown once, copy-to-clipboard, never displayed again)
- Link to Provider Developer Docs
- Sandbox environment access for integration testing

---

#### Screen: Provider Developer Dashboard (`/provider/dashboard`)

**Purpose:** API key management, usage monitoring, and integration health for approved providers.

**Sections:**

**API Key management:**
- Current key: `sk_live_••••••••••••••••` (partially masked)
- `Reveal` button (requires re-auth / 2FA confirmation)
- `Rotate Key` button — generates new key, old key has 24h grace period then revoked
- Key created date, last used timestamp
- Sandbox key (always visible for test environment)

**Usage stats:**
- Requests this month (with limit shown, e.g. `8,420 / 50,000`)
- Success rate (valid issued tokens / total requests)
- Tokens issued vs claimed (shows how many QRs users actually scanned)
- Failed requests breakdown: auth errors / schema errors / rate limits / duplicates

**Activity type configuration:**
- List of allowed activity types for this provider (set by admin on approval)
- Credit value per activity unit (set by platform, read-only for provider)
- e.g. `EV Charge: 1.3 credits/kWh`, `Bus Ride: 18 credits/trip`

**Webhook settings:**
- Optional: provider can register a webhook URL to receive claim confirmations
- Event types: `token.claimed`, `token.expired`, `token.rejected`
- Webhook signing secret (for provider to verify CarbonTrace is the caller)

**Integration logs:**
- Recent API requests: timestamp, endpoint, status code, token ID
- Filterable by date range and status
- Export CSV

**Docs & testing:**
- Link to API reference
- "Send test request" inline tool (sandbox only)
- Sample code snippets: Python, Node.js, cURL

---

#### Screen: QR Scan — In-App (`/scan`)

**Purpose:** User-facing QR scanner to claim a provider-issued activity token.

**Layout:**

- Full-screen camera viewfinder with a rounded scanning frame overlay (forest green corner markers)
- Status strip below viewfinder:
  - Idle: "Point at a CarbonTrace QR code"
  - Detecting: spinner + "Reading code…"
  - Valid: green flash + activity summary card slides up
  - Invalid/expired: red flash + error message

**Claim confirmation card (slides up after valid scan):**
- Activity type icon + name (e.g. ⚡ EV Charge · 42 kWh)
- Provider name (e.g. "Verified by ChargeGrid Network")
- Credits to be earned: `+55 credits`
- Expiry warning if < 2 min remaining on token
- `Claim Credits` confirm button
- `Cancel` dismiss

**Error states:**
- `TOKEN_EXPIRED` — "This QR has expired. Ask the provider to reissue."
- `TOKEN_ALREADY_CLAIMED` — "This QR was already used."
- `TOKEN_INVALID` — "This QR is not a valid CarbonTrace token."
- `PROVIDER_SUSPENDED` — "This provider's integration is currently suspended."

**Entry points to `/scan`:**
- Dashboard navbar — camera icon button
- Submit Activity flow — "Scan a provider QR" option alongside manual upload
- Home screen shortcut (mobile PWA)

---

#### API Reference (design spec — not implementation)

**Base URL:** `https://api.carbontrace.io/v1`

**Authentication:** `Authorization: Bearer <API_KEY>` on all provider endpoints.

**Endpoints:**

```
POST /provider/activity
  Issue an activity token for a completed sustainable action.

  Body:
  {
    "activity_type": "ev_charge" | "bus_ride" | "tree_planting" | "recycling",
    "metadata": {
      "kwh": 42.0,           // EV only
      "route_id": "KL-12B",  // transit only
      "saplings": 3,         // tree planting only
      "weight_kg": 5.2       // recycling only
    },
    "occurred_at": "2025-04-30T18:30:00Z",  // ISO 8601, must be within last 30 min
    "location": {
      "lat": 8.8932,
      "lng": 76.6141
    },
    "user_hint": "sha256_of_user_email"   // optional — pre-binds token to a user
  }

  Response 201:
  {
    "token_id": "tok_01HXYZ...",
    "jwt": "<signed JWT string>",
    "qr_payload": "<base64 PNG of QR>",
    "credits_value": 55,
    "expires_at": "2025-04-30T18:45:00Z"
  }

  Error codes:
  401 - Invalid or revoked API key
  400 - Schema validation failure
  409 - Duplicate activity (same provider + location + timestamp window)
  429 - Rate limit exceeded

GET /provider/tokens/{token_id}
  Check the status of an issued token.
  Returns: issued | claimed | expired | rejected

GET /provider/usage
  Returns usage summary for current billing cycle.
```

---

### V2-B: Organization Dashboard

**Purpose:** Employers or NGOs running internal sustainability programs can enroll employees/members, set targets, and track collective impact — using both manual submissions and provider QR claims.

**Screen: `/org/dashboard`**

**Sections:**

**Program overview card:**
- Program name, organization logo
- Enrolled members: count + active this month
- Total kg CO₂ offset by program: cumulative + this month
- Total credits distributed

**Member leaderboard (internal):**
- Rank, name/avatar, activities this month, offset kg, credits
- Export CSV for HR/ESG reporting

**Target tracking:**
- Admin sets monthly CO₂ offset target for the org
- Progress bar: `247 / 500 kg CO₂ this month`
- Per-member average, top contributor callout

**Credit allocation controls:**
- Org admin can top up member credits as bonus incentives
- Set auto-bonus rules (e.g. "first 5 verified activities in a month → +50 bonus credits")

**Reports:**
- Monthly impact report PDF (auto-generated, branded with org logo)
- Activity type breakdown chart
- Trend graph: month-over-month offset

**Screen: `/org/enroll`**

- Invite members by email or shareable org join link
- Approval mode: auto-approve / admin-approve
- Enrolled member management: view, remove, role assignment (member / org admin)

---

### V2-C: Notification Center

**Purpose:** In-app notification feed consolidating all system events so users never miss a verification result, credit change, or streak alert.

**Screen: `/notifications`**

**Notification types:**

| Type | Trigger | Example |
|---|---|---|
| `VERIFIED` | Submission passes AI + blockchain commit | "Your EV charge (42 kWh) was verified. +55 credits added." |
| `FLAGGED` | Submission flagged by AI or admin | "Your Apr 11 transit submission was flagged. Action required." |
| `REJECTED` | Submission rejected after review | "Submission rejected: unable to verify evidence." |
| `CREDIT_ADDED` | QR claim success | "+18 credits from Public Transit QR scan." |
| `CREDIT_REDEEMED` | Redemption completed | "500 credits redeemed for ₹200 transit voucher." |
| `STREAK_MILESTONE` | Streak achievement | "7-day streak! You've earned the Consistent Commuter badge." |
| `CYCLE_REMINDER` | 3 days before cycle close | "2 flagged items need resolution before April 30." |
| `ORG_UPDATE` | Organization program update | "Your org hit 80% of the monthly CO₂ target." |
| `PROVIDER_CLAIM` | Token about to expire | "You have an unclaimed QR token expiring in 5 minutes." |

**Layout:**
- Bell icon in navbar with unread count badge
- Dropdown preview: last 5 notifications, "View all" link
- Full page: grouped by date (Today / Yesterday / Earlier)
- Each item: icon (type-specific color), message, timestamp, `Mark read` / action CTA
- Bulk: `Mark all read`, filter by type

**Delivery channels:**
- In-app (this screen)
- Push notification (mobile PWA / native)
- Email digest (daily or weekly, configurable in Settings)

---

### V2-D: Streak & Badges (Gamification Layer)

**Purpose:** Drive daily/weekly habit formation through streaks, milestone badges, and XP progression — layered on top of the core credit system without replacing it.

**Concepts:**

**Activity Streak:**
- A streak increments each day the user has at least one verified (or QR-claimed) activity
- Resets to 0 if a day is missed
- Visual: flame icon with day count, color intensifies with streak length (green → amber → orange)
- Grace period: one "streak freeze" per month (consumable, earned at 14-day streak)

**XP (Experience Points):**
- Separate from carbon credits — XP is purely for gamification rank, not redeemable
- Earned alongside credits: each verified activity also grants XP at a fixed rate
- XP accumulates across all time (never resets)
- Rank tiers: Seedling → Sprout → Sapling → Tree → Grove → Forest → Canopy Guardian

**Badge system:**

| Badge | Trigger |
|---|---|
| First Step | First verified activity |
| Consistent Commuter | 7-day streak |
| Monthly Champion | 30-day streak |
| EV Pioneer | 10 verified EV charges |
| Green Thumb | 10 verified tree planting activities |
| Transit Regular | 20 verified transit rides |
| Carbon Milestone: 100kg | 100 kg CO₂ offset total |
| Carbon Milestone: 1000kg | 1,000 kg CO₂ offset total |
| Quick Claimer | Claim a QR token within 2 minutes of issue (×5) |
| Perfect Cycle | Full calendar month with at least one activity every week |
| Evidence Pro | 50 manually uploaded submissions, all verified (no rejections) |

**Screen additions:**

**Profile page — Gamification section:**
- XP bar with current rank label and progress to next rank
- Active streak counter with flame icon
- Badge shelf: earned badges (color) + locked badges (greyed, with unlock condition tooltip)

**Dashboard — Streak widget (small):**
- Compact streak counter in the stats strip or sidebar
- "You're on a 12-day streak 🔥" contextual nudge

**Leaderboard — XP tab:**
- Second tab on Leaderboard alongside CO₂ offset: rank by XP / rank tier
- Filters: Global / Friends / Org

---

## Updated Screens List

| # | Screen | Route | Status |
|---|---|---|---|
| 1 | Landing | `/` | v1 |
| 2 | Register | `/register` | v1 |
| 3 | Login | `/login` | v1 |
| 4 | Dashboard | `/dashboard` | v1 |
| 5 | Submit Activity | `/submit` | v1 |
| 6 | Activity History | `/history` | v1 |
| 7 | Credit Wallet | `/wallet` | v1 |
| 8 | Leaderboard | `/leaderboard` | v1 |
| 9 | Profile & Settings | `/settings` | v1 |
| 10 | Admin Panel | `/admin` | v1 |
| 11 | Sponsor Portal | `/sponsor` | v1 |
| 12 | QR Scanner | `/scan` | v2-A |
| 13 | Provider Register | `/provider/register` | v2-A |
| 14 | Provider Dashboard | `/provider/dashboard` | v2-A |
| 15 | Org Dashboard | `/org/dashboard` | v2-B |
| 16 | Org Enroll | `/org/enroll` | v2-B |
| 17 | Notification Center | `/notifications` | v2-C |
| — | Impact Map | `/map` | on hold |