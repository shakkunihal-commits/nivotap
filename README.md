# NivoTap

A compact client-profile studio with read-only NFC pages. NivoTap turns each client's links into a personal, shareable page that opens in any browser and can be encoded onto an NFC card.

## Features

- Compact, responsive profiles with the original graphite-and-mint design.
- Editable name and Instagram, YouTube, WhatsApp, Snapchat, Spotify, Discord, X, and website links.
- Live profile preview and automatic saving of valid changes.
- A compact client selector for managing every profile created in this browser.
- A unique, read-only public page at `/p/:profileId` for each client, with no editor links or controls.
- Copy NFC links directly without file exports, Save buttons, or delete controls.

## Technologies

TanStack Start, React 19, TypeScript, Vite, custom CSS, Lucide icons, Netlify Functions, and Netlify Database (Postgres) with Drizzle ORM.

## Local Development

Use Node.js 22 and pnpm:

```sh
pnpm install
netlify link
netlify dev --port 8889
```

Link the site to your Netlify project to use the automatically provisioned database. Netlify applies migrations from `netlify/database/migrations/` at deploy time. After changing `db/schema.ts`, generate a migration with:

```sh
pnpm exec drizzle-kit generate --name describe_your_change
```

## Profiles and NFC Cards

Profile data is stored in Netlify Database. Saved-profile management is linked to this browser through a secure HttpOnly cookie; no account is required. Clearing browser cookies removes editing access but does not delete public profiles. Avoid clearing cookies if you need to keep managing your pages.

The home page is the client-management workspace. Select an existing client or choose New client, then enter a name and links. Valid changes save automatically after a short pause. Incomplete links remain in the editor until corrected, and client switching is disabled while changes are pending. Do not leave the page before the saved status appears. The editor shows a retry action if saving fails.

Copy the client's NFC link and encode it onto the card using your card's writing tool. NivoTap does not write, lock, or erase physical NFC cards. Share the `/p/:profileId` URL, not the workspace URL. Visitors only see the name and links; the API checks browser ownership before allowing updates. The workspace does not require an owner login: other browsers may create their own profiles but cannot manage yours.

Names and links are public to anyone with the profile URL. Do not put private information in a public profile. Existing bio data remains stored for compatibility but is no longer displayed or editable.
