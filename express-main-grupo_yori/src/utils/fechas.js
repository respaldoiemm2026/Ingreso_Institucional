import { badRequest } from "./httpError.js";
import { env } from "../config/env.js";

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Convierte "YYYY-MM-DD" en el inicio de ese día (en la zona horaria TZ, por defecto America/Bogota)
export const parseFecha = (valor, campo = "fecha") => {
    if (!FORMATO_FECHA.test(valor)) {
        throw badRequest(`El campo ${campo} debe tener el formato YYYY-MM-DD`);
    }
    const [anio, mes, dia] = valor.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getMonth() !== mes - 1) {
        throw badRequest(`El campo ${campo} no es una fecha válida`);
    }
    return fecha;
};

export const inicioDelDia = (fecha = new Date()) =>
    new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

export const finDelDia = (fecha = new Date()) => {
    const fin = inicioDelDia(fecha);
    fin.setDate(fin.getDate() + 1);
    return fin;
};

export const claveDelDia = (fecha) => {
    const d = new Date(fecha);
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
};

export const horaCorta = (fecha) =>
    new Date(fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: env.timeZone });
