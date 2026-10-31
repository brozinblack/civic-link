# Civic Link Uganda — MVP outcomes

## Public experience and navigation — OPEN
- Build a professional, modern, responsive civic news and citizen-engagement web platform for Uganda with the identity “Civic Link Uganda” and slogan “Informed Citizens. Accountable Leadership. A Better Uganda.” Keep it politically impartial, transparent, inclusive, privacy-conscious and accessible; do not favour a political party, suppress legitimate criticism or encourage hostility.
- Guest visitors can read public news and civic education without registering. Connect MVP pages through working navigation; support small screens and low-cost devices, slow connections, keyboard navigation, sufficient contrast, readable text, and clear loading/error/empty states.
- Include a Civic Link Uganda logo, search, latest/featured/trending story areas and topic paths for politics and Parliament, government/public policy, local government, youth/education, economy/development, East African affairs, fact-checking, civic education, and events. Clearly mark synthetic sample content and placeholder areas.

## News and article reading — OPEN
- Each article card shows headline, image, short description, publication date/time, publisher/source, category, reading-time estimate, save and share controls.
- Article pages provide readable accessible layouts, source attribution and related stories. Distinguish reporting, opinion, sponsored content, official statements and user submissions. Only editorial staff may assign a breaking-news label.
- Search and category controls work over the available MVP content. Seed data is explicitly demo content and does not assert current political events or unverified facts.

## Civic education and learning progress — OPEN
- Provide a learning centre with modules for Understanding Democracy; The Constitution of Uganda; The Role of Parliament; How Laws Are Made; The Executive and Government Institutions; Local Government; Citizens’ Rights and Responsibilities; Electoral Education; Leadership and Public Ethics; Public Finance and National Budgets; Accountability and Transparency; Media Literacy and Fact-Checking; Peaceful Political Participation; and Youth Leadership.
- Support short lessons, references, quizzes and progress tracking in the MVP; identify educational content that needs updating when law or procedure changes. Do not invent constitutional provisions, laws or government procedures. Courses and sample lesson text are visibly marked as demonstration material unless verified against authoritative sources.

## Representatives, questions and concerns — OPEN
- Provide a searchable representative directory and profiles that distinguish sample data from real verified office-holder records. Public office/constituency information and official contact channels are shown only when supported by real approved data.
- Signed-in users can submit questions and private community concerns; users see only their own private submissions unless an authorized staff role is granted. Protect complainant information and do not publish private telephone numbers, residential addresses, identity documents or sensitive allegations.
- Concern status follows `Submitted → Acknowledged → Under Review → Response Published → Closed`. Authorized staff may update a case and explain action taken. Do not claim resolution without an appropriate basis, and explain that submitting a concern does not guarantee an official response. Provide reporting/appeal paths where the MVP supports them.

## Account, privacy and verification boundaries — OPEN
- Implement real sign-in through the platform OAuth flow with secure application sessions. Do not expose secrets, use fake preview users, store plaintext passwords, or infer citizenship from a phone number, residence or address. Guest news and civic education stay public.
- User profile/settings expose only the signed-in user’s own permitted information, preferences, saved articles and learning progress. Do not expose reading, verification, private concern or participation history publicly.
- Explain citizenship choice and the purpose/status/limits of verification. Phone/email channel control is not proof of citizenship. The MVP does not collect identity documents, access government identity databases, or claim demo verification is real. A verified-citizen label is prohibited unless a lawful, authorized verification succeeds.
- Provide a clear privacy notice and demonstrate privacy/access/deletion request entry points. Do not sell identity data or create political profiles or infer political opinions from reading, location, ethnicity, religion or participation.

## Editorial, moderation and administration — OPEN
- Provide editorial and administrator entry points for article drafting/review, content moderation and management. News workflow is Draft → Editorial Review → Fact-Checking → Approval → Publication. Partner submissions do not publish automatically. Important editorial changes are audited.
- Privileged account roles require approval; selecting administrator, journalist, government representative, moderator or public-representative role never grants access. Public officials have a separate professional verification process. A verified representative badge does not imply that every statement is independently verified.
- Enforce role checks and ownership in server-side routes, not only in the interface. Restrict verification records to specifically authorized personnel and log access to sensitive records. Do not make unapproved users administrators.

## Relational data foundation and secure behavior — OPEN
- Build relational data models for users, user profiles, user roles, verification requests/results/audit, consent records, privacy requests, news articles/categories/sources/corrections, media, civic courses/lessons/enrolments, quiz questions/attempts, public representatives/professional verification, citizen questions, community concerns/updates, public commitments/evidence, events/registrations, discussion topics/posts, moderation reports, notifications, editorial reviews and audit logs.
- Use appropriate foreign keys, unique constraints, timestamps and status fields. Keep identity verification data separate from public profile data. Do not store unnecessary identity-document copies or passwords.
- Use server-side validation, parameterized queries, secure sessions, role-based permissions, private handling of sensitive data, rate limiting/abuse protection and audit logs. Do not log passwords, authentication tokens or full identity document numbers. The managed database is MySQL-compatible; ownership enforcement is implemented in server logic because this service does not supply PostgreSQL row-level security.

## Visible MVP limitations — OPEN
- Clearly mark mock data, placeholder integrations and demonstration verification outcomes. Use no real citizens’ identity documents and synthetic content/accounts only.
- Do not claim production legal compliance. Before launch, require review of Uganda’s Data Protection and Privacy Act 2019 and applicable regulations, lawful processing, retention, cross-border transfers, identity provider authorization, communications/consumer protection, copyright/media licensing and online publication rules. Do not connect to government identity sources without explicit authorization and an approved integration.
- Native Flutter apps, live phone OTP, production identity verification, external notification delivery and public deployment are not part of this web MVP.
