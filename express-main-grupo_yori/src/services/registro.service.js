import { TIPOS_REGISTRO } from "../config/constants.js";
import * as registroRepository from "../repositories/registro.repository.js";
import { obtenerPersonalActivo } from "./personal.service.js";
import { claveDelDia, finDelDia, horaCorta, inicioDelDia } from "../utils/fechas.js";
import { badRequest, conflict, notFound } from "../utils/httpError.js";

export const ESTADOS = Object.freeze({ ADENTRO: "ADENTRO", AFUERA: "AFUERA" });

// El estado se calcula con las marcas del día: si ayer no marcó salida, hoy empieza AFUERA
export const obtenerEstadoService = async (id_personal) => {
    await obtenerPersonalActivo(id_personal);
    const ultimo = await registroRepository.leerUltimoRegistro(id_personal, {
        desde: inicioDelDia(),
        hasta: finDelDia(),
    });
    const estado = ultimo?.tipo === TIPOS_REGISTRO.ENTRADA ? ESTADOS.ADENTRO : ESTADOS.AFUERA;
    return { estado, ultimo };
};

export const crearRegistroService = async ({ id_personal, tipo }, id_usuario) => {
    const { estado } = await obtenerEstadoService(id_personal);

    if (tipo === TIPOS_REGISTRO.ENTRADA && estado === ESTADOS.ADENTRO) {
        throw conflict("La persona ya tiene una entrada registrada sin salida");
    }
    if (tipo === TIPOS_REGISTRO.SALIDA && estado === ESTADOS.AFUERA) {
        throw conflict("La persona no tiene una entrada registrada hoy");
    }

    return registroRepository.crearRegistro({ id_personal, id_usuario, tipo });
};

// Los filtros llegan como inicio de día: "hasta" incluye el día completo
const rangoFiltros = ({ hasta, ...resto }) => ({
    ...resto,
    hasta: hasta ? finDelDia(hasta) : undefined,
});

export const leerRegistroService = (filtros) =>
    registroRepository.leerRegistros(rangoFiltros(filtros));

// Agrupa las marcas por persona y día, emparejando cada ENTRADA con su SALIDA
export const leerHistorialService = async (filtros) => {
    const registros = await registroRepository.leerRegistros(rangoFiltros(filtros), "asc");
    const hoy = claveDelDia(new Date());
    const abiertas = new Map();
    const jornadas = [];

    for (const registro of registros) {
        const dia = claveDelDia(registro.fecha);
        const clave = `${registro.id_personal}|${dia}`;

        if (registro.tipo === TIPOS_REGISTRO.ENTRADA) {
            const jornada = {
                dia,
                personal: registro.personal,
                entradaId: registro.id,
                entrada: registro.fecha,
                salidaId: null,
                salida: null,
            };
            jornadas.push(jornada);
            abiertas.set(clave, jornada);
        } else if (abiertas.has(clave)) {
            Object.assign(abiertas.get(clave), { salidaId: registro.id, salida: registro.fecha });
            abiertas.delete(clave);
        }
    }

    return jornadas
        .map((jornada) => ({
            ...jornada,
            estado: jornada.salida ? "COMPLETO" : jornada.dia === hoy ? "EN_CURSO" : "SIN_SALIDA",
        }))
        .reverse();
};

// ---------- Correcciones (ADMIN) ----------

// Ubica una jornada a partir de su marca de entrada, con las marcas vecinas del mismo día
const obtenerJornada = async (entradaId) => {
    const entrada = await registroRepository.leerRegistroById(entradaId);
    if (!entrada || entrada.tipo !== TIPOS_REGISTRO.ENTRADA) {
        throw notFound("Marca de entrada no encontrada");
    }

    const delDia = await registroRepository.leerRegistros(
        { id_personal: entrada.id_personal, desde: inicioDelDia(entrada.fecha), hasta: finDelDia(entrada.fecha) },
        "asc",
    );
    const i = delDia.findIndex((r) => r.id === entrada.id);
    const salida = delDia[i + 1]?.tipo === TIPOS_REGISTRO.SALIDA ? delDia[i + 1] : null;

    return {
        entrada,
        salida,
        anterior: delDia[i - 1] ?? null,
        siguiente: delDia[salida ? i + 2 : i + 1] ?? null,
    };
};

// Las marcas del día deben seguir alternando ENTRADA, SALIDA, ENTRADA... en orden de hora
const validarCorreccion = (jornada, { entrada, salida }) => {
    const dia = claveDelDia(jornada.entrada.fecha);
    const ahora = new Date();

    for (const fecha of [entrada, salida].filter(Boolean)) {
        if (claveDelDia(fecha) !== dia) throw badRequest("Las horas deben quedar en el mismo día de la jornada");
        if (fecha > ahora) throw badRequest("No se pueden registrar horas futuras");
    }
    if (jornada.anterior && entrada <= jornada.anterior.fecha) {
        throw badRequest(`La entrada debe ser posterior a la marca anterior del día (${horaCorta(jornada.anterior.fecha)})`);
    }
    if (salida && salida <= entrada) {
        throw badRequest("La salida debe ser posterior a la entrada");
    }
    if (jornada.siguiente) {
        if (!salida) throw badRequest("La jornada no puede quedar sin salida: hay otra entrada después ese día");
        if (salida >= jornada.siguiente.fecha) {
            throw badRequest(`La salida debe ser anterior a la siguiente entrada del día (${horaCorta(jornada.siguiente.fecha)})`);
        }
    }
};

const accionSalida = (jornada, salida, id_usuario) => {
    if (jornada.salida && salida) return { accion: "actualizar", id: jornada.salida.id, fecha: salida };
    if (jornada.salida) return { accion: "eliminar", id: jornada.salida.id };
    if (salida) {
        const data = { id_personal: jornada.entrada.id_personal, id_usuario, tipo: TIPOS_REGISTRO.SALIDA, fecha: salida };
        return { accion: "crear", data };
    }
    return { accion: null };
};

export const corregirJornadaService = async (entradaId, cambios, id_usuario) => {
    const jornada = await obtenerJornada(entradaId);
    validarCorreccion(jornada, cambios);

    await registroRepository.guardarCorreccionJornada({
        entrada: { id: jornada.entrada.id, fecha: cambios.entrada },
        salida: accionSalida(jornada, cambios.salida, id_usuario),
    });
};

// Borra la entrada y, si la tiene, su salida: nunca queda una salida huérfana
export const eliminarJornadaService = async (entradaId) => {
    const { entrada, salida } = await obtenerJornada(entradaId);
    await registroRepository.eliminarRegistros([entrada.id, salida?.id].filter(Boolean));
};
