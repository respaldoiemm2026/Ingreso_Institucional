import { Prisma } from "@prisma/client";
import { conflict } from "./httpError.js";

const esErrorPrisma = (error, codigo) =>
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === codigo;

// Ejecuta la operación y traduce un valor único repetido (P2002) a un 409 con mensaje claro
export const conMensajeDuplicado = async (operacion, mensaje) => {
    try {
        return await operacion();
    } catch (error) {
        if (esErrorPrisma(error, "P2002")) throw conflict(mensaje);
        throw error;
    }
};

// Igual para una fila que otras tablas todavía referencian (P2003)
export const conMensajeRelacionado = async (operacion, mensaje) => {
    try {
        return await operacion();
    } catch (error) {
        if (esErrorPrisma(error, "P2003")) throw conflict(mensaje);
        throw error;
    }
};
