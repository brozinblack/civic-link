# Civic Link Uganda

A responsive, guest-readable civic news and education MVP. Built with Next.js, TypeScript and the managed MySQL-compatible service.

## Run

Use Node 22 and pnpm 11. Install with `pnpm install`, apply the additive schema with `pnpm db:migrate`, then start Preview with `pnpm dev`. The site can render public demo content without an account. OAuth sign-in and persistent features require the managed runtime variables and database connection supplied by the project environment.

## Demo and safety boundaries

All seeded stories and directory entries are labeled sample content. The identity-verification interface is informational only: it does not collect identity documents, contact government identity records or establish citizenship. Role selection never grants privileged access. The first admin/editor accounts require an authorized provisioning process. The platform database is MySQL-compatible; per-record ownership is checked in server routes, not through PostgreSQL row-level security. Review the source, provider authorization, current Ugandan law, backups and operational security before launch.

The homepage skyline image is from Wikimedia Commons, by Omoo, available under CC BY-SA 3.0 and GFDL. See its attribution and license link in the site footer and the original [file page](https://commons.wikimedia.org/wiki/File:KampalaSkyline.jpg).
