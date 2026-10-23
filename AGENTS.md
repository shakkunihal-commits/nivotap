# NivoTap

NivoTap is a creator landing page and link-profile builder deployed on Netlify. It uses TanStack Start, React 19, TypeScript, Vite, Lucide icons, and custom CSS with a graphite/mint theme.

## Architecture

- `src/routes/index.tsx` renders the landing page and editor in `src/components/LandingPage.tsx`.
- `src/routes/p.$profileId.tsx` renders a public, read-only profile at `/p/:profileId`.
- `src/components/ProfileCard.tsx` is shared by the live preview and public profile.
- `src/lib/profiles.ts` contains shared types, platform definitions, and browser API helpers.
- `src/styles.css` contains responsive styling, design tokens, and reduced-motion handling.
- `netlify/functions/profiles.mts` handles CRUD at `/api/profiles` and validates all profile input.
- `db/schema.ts` defines the Postgres profiles table; `db/index.ts` creates the Drizzle Netlify Database client.
- `netlify/database/migrations/` contains deploy-applied migrations generated with Drizzle Kit.

## Conventions

Keep TypeScript strict and use type-only imports. Use named React components and descriptive variables. Keep reusable theme values in CSS custom properties. Preserve mobile responsiveness and keyboard focus styles. Do not add inline code comments unless requested.

Use `@netlify/database` and the beta versions of Drizzle ORM and Drizzle Kit, as the Netlify adapter requires that release line. Generate a named migration whenever the schema changes. Never expose database access to client code.

## Important Decisions

Profiles persist in Netlify Database, not localStorage. An opaque HttpOnly browser cookie links a visitor to their saved profiles, with only its SHA-256 hash stored in the database. There are no accounts or sign-up flows. Clearing browser cookies loses management access; public profile URLs remain live until explicitly deleted. Treat cookie ownership as a capability and never return owner hashes in API responses.

Public profile UUIDs are unique URLs suitable for encoding on NFC cards. This site does not write or erase NFC hardware. Clear fields resets the current draft only; delete profile removes its public page. Only http/https link targets are accepted. Mutation requests must be same-origin.

The router generates `src/routeTree.gen.ts` automatically; do not hand-edit it. Share metadata lives in the root route. Do not add an Open Graph image; the platform supplies one.

Use `pnpm install` for dependencies and Netlify CLI on port 8889 for local development. The deployment environment handles build validation; do not run local builds, dev servers, or tests during an agent run when instructed not to.
