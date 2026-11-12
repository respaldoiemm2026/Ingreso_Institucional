import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (usuario) => {
    const payload = {
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.rol?.name,
    };
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

// Milisegundos que le quedan al token: se usa como maxAge de la cookie
export const tokenMaxAge = (token) => {
    const { exp } = jwt.decode(token);
    return exp * 1000 - Date.now();
};
