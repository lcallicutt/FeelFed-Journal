import { Router, type IRouter } from "express";
import healthRouter from "./health";
import momentsRouter from "./moments";
import waitlistRouter from "./waitlist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(momentsRouter);
router.use(waitlistRouter);

export default router;
