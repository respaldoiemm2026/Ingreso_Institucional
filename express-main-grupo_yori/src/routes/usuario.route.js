import { Router } from "express";
import {
    controllerActualizarUsuario,
    controllerCrearUsuario,
    controllerEliminarUsuario,
    controllerLeerUsuario,
} from "../controllers/usuario.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.post("/", asyncHandler(controllerCrearUsuario));
router.get("/", asyncHandler(controllerLeerUsuario));
router.put("/:id", asyncHandler(controllerActualizarUsuario));
router.delete("/:id", asyncHandler(controllerEliminarUsuario));

export default router;
