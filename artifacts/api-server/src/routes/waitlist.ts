import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { waitlistEntriesTable } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const JoinWaitlistBody = z.object({
  email: z.string().email(),
});

router.post("/waitlist", async (req, res) => {
  const parsed = JoinWaitlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const { email } = parsed.data;

  try {
    const [entry] = await db
      .insert(waitlistEntriesTable)
      .values({ email })
      .onConflictDoNothing()
      .returning();

    if (!entry) {
      // Email already exists — treat as success (idempotent)
      res.status(200).json({ message: "Already on the waitlist" });
      return;
    }

    res.status(201).json({ message: "You're on the list!", email: entry.email });
  } catch (err) {
    console.error("Waitlist insert error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
