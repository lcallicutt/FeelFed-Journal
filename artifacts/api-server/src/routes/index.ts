import { Router, type IRouter } from "express";
import healthRouter from "./health";
import momentsRouter from "./moments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(momentsRouter);

export default router;
