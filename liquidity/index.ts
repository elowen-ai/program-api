import { Router } from "express";

import mining from "./mining";
import general from "./general";

const router = Router();

router.use(general)
router.use("/mining", mining);

export default router;
