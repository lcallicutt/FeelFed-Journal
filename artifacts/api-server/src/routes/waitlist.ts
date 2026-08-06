import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { waitlistEntriesTable } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const JoinWaitlistBody = z.object({
  email: z.string().email(),
  firstName: z.string().max(100).optional(),
  interest: z.string().max(200).optional(),
});

router.post("/waitlist", async (req, res) => {
  const parsed = JoinWaitlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const { email, firstName, interest } = parsed.data;

  try {
    const [entry] = await db
      .insert(waitlistEntriesTable)
      .values({ email, firstName, interest })
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
