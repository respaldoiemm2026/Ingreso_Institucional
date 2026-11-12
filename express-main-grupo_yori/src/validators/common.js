import { badRequest } from "../utils/httpError.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const texto = (valor, campo, { requerido = true, max = 120 } = {}) => {
    if (valor === undefined || valor === null || String(valor).trim() === "") {
        if (requerido) throw badRequest(`El campo ${campo} es obligatorio`);
        return undefined;
    }
    if (typeof valor !== "string") throw badRequest(`El campo ${campo} debe ser texto`);
    const limpio = valor.trim();
    if (limpio.length > max) throw badRequest(`El campo ${campo} admite máximo ${max} caracteres`);
    return limpio;
};

export const email = (valor, campo = "email", opciones) => {
    const limpio = texto(valor, campo, opciones);
    if (limpio !== undefined && !EMAIL.test(limpio)) throw badRequest("El email no es válido");
    return limpio?.toLowerCase();
};

export const unoDe = (valor, campo, permitidos, opciones) => {
    const limpio = texto(valor, campo, opciones);
    if (limpio !== undefined && !permitidos.includes(limpio)) {
        throw badRequest(`El campo ${campo} debe ser uno de: ${permitidos.join(", ")}`);
    }
    return limpio;
};

// Quita las claves undefined para que Prisma no las toque en un update
export const sinIndefinidos = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
