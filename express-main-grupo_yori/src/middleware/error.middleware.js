import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/httpError.js";

export const notFoundHandler = (req, res) => {
    res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

const PRISMA_ERRORS = {
    P1001: [503, "La base de datos no está disponible. Intente de nuevo en unos segundos"],
    P2002: [409, "Ya existe un registro con ese valor único"],
    P2003: [409, "El registro está relacionado con otros datos"],
    P2025: [404, "Recurso no encontrado"],
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ message: err.message });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError && PRISMA_ERRORS[err.code]) {
        const [status, message] = PRISMA_ERRORS[err.code];
        return res.status(status).json({ message });
    }

    // JSON mal formado en el body
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "El cuerpo de la petición no es un JSON válido" });
    }

    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
};
