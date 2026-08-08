import { Router, type IRouter } from "express";
import { db, journalEntriesTable } from "@workspace/db";
import {
  GetEntriesQueryParams,
  UpsertEntryBody,
  BulkUpsertEntriesBody,
  DeleteEntryBody,
} from "@workspace/api-zod";
import { and, asc, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

type EntryPayload = { id: string; kind: string; at: string } & Record<string, unknown>;

function upsertValues(deviceId: string, entry: EntryPayload) {
  return {
    deviceId,
    entryId: entry.id,
    kind: entry.kind,
    at: new Date(entry.at),
    data: entry as Record<string, unknown>,
  };
}

const onConflictSet = {
  kind: sql`excluded.kind`,
  at: sql`excluded.at`,
  data: sql`excluded.data`,
  updatedAt: sql`now()`,
};

router.get("/entries", async (req, res) => {
  const parsed = GetEntriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const rows = await db
    .select()
    .from(journalEntriesTable)
    .where(eq(journalEntriesTable.deviceId, parsed.data.deviceId))
    .orderBy(asc(journalEntriesTable.at));

  res.json({ entries: rows.map((r) => r.data) });
});

router.put("/entries", async (req, res) => {
  const parsed = UpsertEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  // Zod validates the known fields; store the raw body so kind-specific
  // fields (level, fullness, sensations, ...) are preserved.
  const { deviceId } = parsed.data;
  const payload = (req.body as { entry: EntryPayload }).entry;

  await db
    .insert(journalEntriesTable)
    .values(upsertValues(deviceId, payload))
    .onConflictDoUpdate({
      target: [journalEntriesTable.deviceId, journalEntriesTable.entryId],
      set: onConflictSet,
    });

  res.json(payload);
});

router.post("/entries/bulk", async (req, res) => {
  const parsed = BulkUpsertEntriesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { deviceId } = parsed.data;
  const entries = (req.body as { entries: EntryPayload[] }).entries;
  if (entries.length > 0) {
    const values = entries.map((e) => upsertValues(deviceId, e));
    await db
      .insert(journalEntriesTable)
      .values(values)
      .onConflictDoUpdate({
        target: [journalEntriesTable.deviceId, journalEntriesTable.entryId],
        set: onConflictSet,
      });
  }

  res.json({ count: entries.length });
});

router.post("/entries/delete", async (req, res) => {
  const parsed = DeleteEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { deviceId, entryId } = parsed.data;
  await db
    .delete(journalEntriesTable)
    .where(
      and(
        eq(journalEntriesTable.deviceId, deviceId),
        eq(journalEntriesTable.entryId, entryId),
      ),
    );

  res.status(204).end();
});

export default router;
