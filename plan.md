# Civic Link Uganda — MVP implementation plan

## Agreed scope and architecture

Deliver a responsive, browser-based civic platform MVP, not the separate Flutter apps or a full production rollout. Use Next.js App Router with TypeScript and server route handlers. Keep public reading and civic learning available to guests. Use the managed MySQL-compatible database (the project service, not the PostgreSQL suggested in the original brief) for durable records, with parameterized SQL and additive migrations. Add an explicit schema and seed only clearly labeled synthetic demo content.

Use the platform's Manus OAuth as the account provider and build application session handling around the returned identity. Do not create a fake logged-in preview identity, collect passwords or phone numbers, or claim channel/citizenship verification that the provider does not establish. Session state, profile data, role checks and user-owned records are handled on the server. The sensitive identity workflow is informational/demo-only: no identity document upload, government-database request, citizenship determination or real verification result. Privileged role requests require an authorized approval path; choosing a role in the UI never grants it.

The first version covers a navigable news home and article views, civic learning/course/lesson/quiz flows, representative directory/profile, citizen questions and private concern tracking, user profile/settings, and role-gated editorial/moderation/administration entry points. Public accountability, events, media, and discussion can appear in the navigation as clearly identified next-stage areas rather than pretending their full workflows are live. The MVP will be usable on small mobile screens and slow connections, include accessible keyboard navigation and clear states, and label mock content/integrations prominently.

### Application structure

- `app/`: server-rendered pages, shared layout, and API route handlers for OAuth, session/profile, article saves, learning progress, questions, concerns, and privileged editorial/moderation actions.
- `components/`: responsive header/navigation, brand mark, article cards, forms, progress indicators, status labels, notices, and page sections.
- `lib/`: database connection and parameterized query helpers; session/OAuth validation; authorization; origin/CSRF checks; rate limits; validation; demo seed content.
- `db/migrations/`: additive MySQL schema and a versioned, idempotent demonstration-content seed.
- `public/`: route manifest, original wordmark/mark, and the credited Kampala skyline image.
- `plan.md` and `TODO.md`: approved implementation/design decisions and open outcome criteria.

### Database and authorization boundaries

Model accounts, profiles, role assignments, verification requests/results/audit, consent/privacy requests, articles/categories/sources/corrections/editorial reviews, courses/lessons/enrolment/quiz attempts, representatives and professional verification, questions, concerns/updates, commitments/evidence, events/registrations, media, discussions/posts/moderation reports, notifications and audit logs. Use foreign keys, unique constraints, timestamps, status fields and indexes where appropriate. Keep account identifiers separate from public profile fields and do not store identity-document copies. The MVP's MySQL service does not provide PostgreSQL-style row-level security; enforce ownership and privileged access in server-side queries, and describe this as an MVP limitation requiring deployment security review before launch.

Use a role matrix: public/guest read access for published material; signed-in users can access only their own profile, saved items, learning progress, questions and concerns; authorized editor/moderator/admin roles are granted only after review and are checked in server endpoints, not merely hidden in the UI. Concern submissions are private by default and have the explicit status path `Submitted → Acknowledged → Under Review → Response Published → Closed`. Do not imply a submission guarantees a response or resolution.

### Design system

**Design Movement:** Contemporary East African civic-editorial design, drawing on trusted print journalism and public-service information rather than government propaganda or partisan campaign graphics.

**Core Principles:** Calm editorial clarity; equal access to public information; visible sourcing and status; minimal data collection and low-bandwidth restraint.

**Color Philosophy:** Ink navy anchors institutional trust; warm paper white keeps long reading comfortable; muted gold marks education and civic action; a limited flag-inspired red is reserved for urgency and does not encode political affiliation. The signature brand color is a distinctive deep civic navy (`#14324A`).

**Layout Paradigm:** A newspaper-like, left-aligned editorial rail with a wide lead-story area, a narrow latest-updates column and horizontal topic navigation. Small screens collapse the rail into a compact sticky header and stacked reading flow. Avoid generic centered dashboard cards for public content.

**Signature Elements:** A linked speech-mark emblem; a thin gold rule under section eyebrows; concise source/time metadata paired with a small “DEMO CONTENT” disclosure on seeded stories.

**Interaction Philosophy:** Navigation and form feedback are immediate, plain-language and reversible where possible. Save/share, filters and tabs communicate state without requiring animation. Authentication and identity status are never inferred from appearance or device.

**Animation:** Restrained 120–180 ms color/opacity changes for hover and focus; no autoplay carousels, parallax, or large motion; respect `prefers-reduced-motion` and keep layout stable while loading.

**Typography System:** Georgia or a similar system serif for display headlines; system sans-serif for navigation, body and form controls. Use a small set of clear sizes, generous line-height, and a 65–75 character reading measure.

**Brand Essence:** An independent civic information and participation service for people following Uganda's public life; measured, useful, inclusive.

**Brand Voice:** Direct, calm and non-partisan. Example lines: “What changed. Who decided. What comes next.” “Your concern is recorded; an official reply is not guaranteed.”

**Wordmark & Logo:** A compact linked-speech emblem with a central civic dot and an original two-line CIVIC LINK / UGANDA wordmark; use the same vector mark in the header, footer and app metadata asset.

### Delivery boundaries

The implementation is a usable MVP and not a legal or security certification. No identity-provider credentials beyond platform OAuth are assumed. Real government identity verification, phone OTP, production email/notification delivery, legal review, production backup/monitoring, and native mobile clients remain outside this initial slice. Do not publish without a separate request and confirmed publish result.
