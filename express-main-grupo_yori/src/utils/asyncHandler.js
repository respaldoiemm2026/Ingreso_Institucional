// Express 4 no captura los errores de funciones async: los envía al middleware de errores
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
