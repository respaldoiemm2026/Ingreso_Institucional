import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.post("/logout", logout);
router.get("/me", authenticate, asyncHandler(me));
// Solo un administrador puede crear cuentas nuevas
router.post("/register", authenticate, authorize(ROLES.ADMIN), asyncHandler(register));

export default router;
