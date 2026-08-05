import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { momentsTable } from "@workspace/db";
import { SaveMomentBody, GetMomentsQueryParams } from "@workspace/api-zod";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/moments", async (req, res) => {
  const parsed = SaveMomentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { deviceId, fullness, energy, hydration, reflection } = parsed.data;

  const [moment] = await db
    .insert(momentsTable)
    .values({ deviceId, fullness, energy, hydration, reflection: reflection ?? null })
    .returning();

  res.status(201).json(moment);
});

router.get("/moments", async (req, res) => {
  const parsed = GetMomentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { deviceId, limit } = parsed.data;

  const moments = await db
    .select()
    .from(momentsTable)
    .where(eq(momentsTable.deviceId, deviceId))
    .orderBy(desc(momentsTable.createdAt))
    .limit(limit ?? 20);

  res.json({ moments });
});

export default router;
