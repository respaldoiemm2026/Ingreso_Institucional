import { badRequest } from "../utils/httpError.js";
import { email, sinIndefinidos, texto } from "./common.js";

const MIN_PASSWORD = 8;

const password = (valor, requerido) => {
    const limpio = texto(valor, "password", { requerido, max: 72 });
    if (limpio !== undefined && limpio.length < MIN_PASSWORD) {
        throw badRequest(`La contraseña debe tener mínimo ${MIN_PASSWORD} caracteres`);
    }
    return limpio;
};

export const validarUsuario = (body, { parcial = false } = {}) => {
    const requerido = !parcial;
    return sinIndefinidos({
        // "name" se acepta por compatibilidad con el antiguo /auth/register
        nombre: texto(body.nombre ?? body.name, "nombre", { requerido }),
        email: email(body.email, "email", { requerido }),
        password: password(body.password, requerido),
        id_rol: texto(body.id_rol, "id_rol", { requerido }),
    });
};
