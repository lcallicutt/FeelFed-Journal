import { pgTable, text, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { z } from "zod";

// Journal entries synced from the FeelFed app. The full entry payload is
// stored as JSON (shapes vary per kind); deviceId + entryId identify a row.
export const journalEntriesTable = pgTable(
  "journal_entries",
  {
    deviceId: text("device_id").notNull(),
    entryId: text("entry_id").notNull(),
    kind: text("kind").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull(),
    data: jsonb("data").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.deviceId, t.entryId] })],
);

// Defined manually to avoid drizzle-zod/zod version boundary issues
export const insertJournalEntrySchema = z.object({
  deviceId: z.string().min(1),
  entryId: z.string().min(1),
  kind: z.string().min(1),
  at: z.string().datetime({ offset: true }),
  data: z.record(z.unknown()),
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryRow = typeof journalEntriesTable.$inferSelect;
