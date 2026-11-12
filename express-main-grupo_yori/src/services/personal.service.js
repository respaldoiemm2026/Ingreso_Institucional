import * as personalRepository from "../repositories/personal.repository.js";
import { notFound } from "../utils/httpError.js";
import { conMensajeDuplicado } from "../utils/prismaErrors.js";

const DOCUMENTO_DUPLICADO = "Ya existe personal registrado con ese documento";

export const crearPersonalService = async (data) => {
    // Si la persona fue eliminada antes (borrado lógico), se reactiva con los datos nuevos
    const existente = await personalRepository.leerPersonalByDocumento(data.documento);
    if (existente && !existente.activo) {
        return personalRepository.actualizarPersonal(existente.id, { area: null, ...data, activo: true });
    }
    return conMensajeDuplicado(() => personalRepository.crearPersonal(data), DOCUMENTO_DUPLICADO);
};

export const leerPersonalService = (filtros) => personalRepository.leerPersonal(filtros);

export const obtenerPersonalActivo = async (id) => {
    const personal = await personalRepository.leerPersonalById(id);
    if (!personal || !personal.activo) throw notFound("Personal no encontrado");
    return personal;
};

export const actualizarPersonalService = async (id, data) => {
    await obtenerPersonalActivo(id);
    return conMensajeDuplicado(() => personalRepository.actualizarPersonal(id, data), DOCUMENTO_DUPLICADO);
};

// Borrado lógico: se conserva el historial de registros de la persona
export const eliminarPersonalService = async (id) => {
    await obtenerPersonalActivo(id);
    await personalRepository.actualizarPersonal(id, { activo: false });
};
