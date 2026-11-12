import { CARGOS, TIPOS_REGISTRO } from "../config/constants.js";
import { parseFecha } from "../utils/fechas.js";
import { badRequest } from "../utils/httpError.js";
import { texto, unoDe } from "./common.js";

const TIPOS = Object.values(TIPOS_REGISTRO);

export const validarNuevoRegistro = (body) => ({
    id_personal: texto(body.id_personal, "id_personal"),
    tipo: unoDe(body.tipo, "tipo", TIPOS),
});

const fechaHora = (valor, campo, { requerido }) => {
    if (valor === undefined || valor === null || valor === "") {
        if (requerido) throw badRequest(`El campo ${campo} es obligatorio`);
        return null;
    }
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) throw badRequest(`El campo ${campo} no es una fecha válida`);
    return fecha;
};

// salida: null deja la jornada sin salida
export const validarCorreccionJornada = (body) => ({
    entrada: fechaHora(body.entrada, "entrada", { requerido: true }),
    salida: fechaHora(body.salida, "salida", { requerido: false }),
});

export const validarFiltrosRegistro = (query) => {
    const desde = query.desde ? parseFecha(query.desde, "desde") : undefined;
    const hasta = query.hasta ? parseFecha(query.hasta, "hasta") : undefined;
    if (desde && hasta && desde > hasta) {
        throw badRequest("La fecha 'desde' no puede ser mayor que 'hasta'");
    }
    return {
        desde,
        hasta,
        cargo: unoDe(query.cargo, "cargo", CARGOS, { requerido: false }),
        id_personal: texto(query.id_personal, "id_personal", { requerido: false }),
    };
};
