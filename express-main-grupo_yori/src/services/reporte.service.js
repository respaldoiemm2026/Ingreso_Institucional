import { TIPOS_REGISTRO } from "../config/constants.js";
import { contarPersonalActivo } from "../repositories/personal.repository.js";
import { leerRegistros } from "../repositories/registro.repository.js";
import { claveDelDia, finDelDia, inicioDelDia } from "../utils/fechas.js";

export const resumenDelDiaService = async (fecha = new Date()) => {
    const desde = inicioDelDia(fecha);
    const [totalPersonal, registros] = await Promise.all([
        contarPersonalActivo(),
        leerRegistros({ desde, hasta: finDelDia(fecha) }, "asc"),
    ]);

    let entradas = 0;
    let salidas = 0;
    const ultimoTipo = new Map();

    for (const { id_personal, tipo } of registros) {
        if (tipo === TIPOS_REGISTRO.ENTRADA) entradas++;
        else salidas++;
        ultimoTipo.set(id_personal, tipo);
    }

    const presentes = [...ultimoTipo.values()].filter((tipo) => tipo === TIPOS_REGISTRO.ENTRADA).length;
    const asistieron = ultimoTipo.size;

    return {
        fecha: claveDelDia(desde),
        totalPersonal,
        entradas,
        salidas,
        presentes,
        ausentes: Math.max(totalPersonal - asistieron, 0),
    };
};
