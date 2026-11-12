import { CARGOS } from "../config/constants.js";
import { badRequest } from "../utils/httpError.js";
import { sinIndefinidos, texto, unoDe } from "./common.js";

export const validarPersonal = (body, { parcial = false } = {}) => {
    const requerido = !parcial;
    const documento = texto(body.documento, "documento", { requerido, max: 20 });
    if (documento !== undefined && !/^[0-9A-Za-z-]+$/.test(documento)) {
        throw badRequest("El documento solo admite letras, números y guiones");
    }
    return sinIndefinidos({
        nombre: texto(body.nombre, "nombre", { requerido }),
        documento,
        cargo: unoDe(body.cargo, "cargo", CARGOS, { requerido }),
        // null permite borrar el área al editar
        area: body.area === "" || body.area === null ? null : texto(body.area, "area", { requerido: false }),
    });
};

export const validarFiltrosPersonal = (query) => ({
    q: texto(query.q, "q", { requerido: false }),
    cargo: unoDe(query.cargo, "cargo", CARGOS, { requerido: false }),
});
