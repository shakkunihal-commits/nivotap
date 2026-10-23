import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { ProfileLink } from '../src/lib/profiles'

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerHash: text('owner_hash').notNull(),
  name: text('name').notNull(),
  bio: text('bio').notNull().default(''),
  links: jsonb('links').$type<ProfileLink[]>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('profiles_owner_idx').on(table.ownerHash)])
