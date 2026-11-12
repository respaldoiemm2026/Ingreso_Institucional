import { Router } from "express";
import {
    controllerActualizarRol,
    controllerCrearRol,
    controllerEliminarRol,
    controllerLeerRol,
} from "../controllers/rol.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.post("/", asyncHandler(controllerCrearRol));
router.get("/", asyncHandler(controllerLeerRol));
router.put("/:id", asyncHandler(controllerActualizarRol));
router.delete("/:id", asyncHandler(controllerEliminarRol));

export default router;
