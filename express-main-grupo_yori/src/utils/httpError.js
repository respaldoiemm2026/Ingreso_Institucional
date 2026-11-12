export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const badRequest = (message) => new HttpError(400, message);
export const unauthorized = (message = "No autenticado") => new HttpError(401, message);
export const forbidden = (message = "No tiene permisos para esta acción") => new HttpError(403, message);
export const notFound = (message = "Recurso no encontrado") => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);
