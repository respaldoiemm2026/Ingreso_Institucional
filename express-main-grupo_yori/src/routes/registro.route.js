import { Router } from "express";
import {
    controllerCorregirJornada,
    controllerCrearRegistro,
    controllerEliminarJornada,
    controllerEstado,
    controllerHistorial,
    controllerLeerRegistro,
} from "../controllers/registro.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.use(authenticate);

router.post("/", asyncHandler(controllerCrearRegistro));
router.get("/", asyncHandler(controllerLeerRegistro));
router.get("/historial", asyncHandler(controllerHistorial));
router.get("/estado/:idPersonal", asyncHandler(controllerEstado));
// Corregir o borrar una jornada (entrada + salida) queda reservado al administrador.
// :id es el id de la marca de ENTRADA de la jornada.
router.put("/jornada/:id", authorize(ROLES.ADMIN), asyncHandler(controllerCorregirJornada));
router.delete("/jornada/:id", authorize(ROLES.ADMIN), asyncHandler(controllerEliminarJornada));

export default router;
