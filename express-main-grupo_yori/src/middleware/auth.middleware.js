import { verifyToken } from "../utils/jwt.js";
import { forbidden, unauthorized } from "../utils/httpError.js";
import { leerUsuarioById } from "../repositories/usuario.repository.js";

export const authenticate = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(unauthorized());
    }

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        return next(unauthorized("Sesión inválida o expirada"));
    }

    try {
        // El rol se lee de la base de datos: un cambio de rol o una cuenta
        // eliminada aplica de inmediato, sin esperar a que venza el token
        const usuario = await leerUsuarioById(payload.sub);
        if (!usuario) {
            return next(unauthorized("La cuenta ya no existe"));
        }
        req.user = { sub: usuario.id, email: usuario.email, rol: usuario.rol.name };
        next();
    } catch (error) {
        next(error);
    }
};

// Uso: router.post("/", authenticate, authorize(ROLES.ADMIN), controller)
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.rol)) {
        return next(forbidden());
    }
    next();
};
