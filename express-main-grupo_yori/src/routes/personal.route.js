import { Router } from "express";
import {
    controllerActualizarPersonal,
    controllerCrearPersonal,
    controllerEliminarPersonal,
    controllerLeerPersonal,
} from "../controllers/personal.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// El vigilante también administra el personal; las cuentas de usuario siguen siendo solo del ADMIN
const gestionaPersonal = authorize(ROLES.ADMIN, ROLES.VIGILANTE);

router.use(authenticate);

router.get("/", asyncHandler(controllerLeerPersonal));
router.post("/", gestionaPersonal, asyncHandler(controllerCrearPersonal));
router.put("/:id", gestionaPersonal, asyncHandler(controllerActualizarPersonal));
router.delete("/:id", gestionaPersonal, asyncHandler(controllerEliminarPersonal));

export default router;
