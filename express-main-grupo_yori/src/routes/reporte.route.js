import { Router } from "express";
import { controllerResumen } from "../controllers/reporte.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/resumen", authenticate, asyncHandler(controllerResumen));

export default router;
