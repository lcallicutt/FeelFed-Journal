import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const momentsTable = pgTable("moments", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  fullness: integer("fullness").notNull(),
  energy: integer("energy").notNull(),
  hydration: integer("hydration").notNull(),
  reflection: text("reflection"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Defined manually to avoid drizzle-zod/zod version boundary issues
export const insertMomentSchema = z.object({
  deviceId: z.string(),
  fullness: z.number().int().min(0).max(10),
  energy: z.number().int().min(0).max(10),
  hydration: z.number().int().min(0).max(10),
  reflection: z.string().nullable().optional(),
});

export type InsertMoment = z.infer<typeof insertMomentSchema>;
export type Moment = typeof momentsTable.$inferSelect;
