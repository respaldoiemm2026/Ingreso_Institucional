import prisma from "../prisma.js";

const REGISTRO_DETALLE = {
    personal: { select: { id: true, nombre: true, documento: true, cargo: true, area: true } },
    usuario: { select: { id: true, nombre: true } },
};

export const crearRegistro = (data) =>
    prisma.registro.create({ data, include: REGISTRO_DETALLE });

export const leerRegistros = ({ desde, hasta, cargo, id_personal } = {}, orden = "desc") =>
    prisma.registro.findMany({
        where: {
            id_personal,
            fecha: { gte: desde, lt: hasta },
            ...(cargo && { personal: { cargo } }),
        },
        include: REGISTRO_DETALLE,
        orderBy: { fecha: orden },
    });

export const leerUltimoRegistro = (id_personal, { desde, hasta } = {}) =>
    prisma.registro.findFirst({
        where: { id_personal, fecha: { gte: desde, lt: hasta } },
        orderBy: { fecha: "desc" },
    });

export const contarRegistros = ({ tipo, desde, hasta }) =>
    prisma.registro.count({ where: { tipo, fecha: { gte: desde, lt: hasta } } });

export const leerRegistroById = (id) => prisma.registro.findUnique({ where: { id } });

// Aplica en una sola transacción la corrección de una jornada (entrada + salida)
export const guardarCorreccionJornada = ({ entrada, salida }) =>
    prisma.$transaction(async (tx) => {
        await tx.registro.update({ where: { id: entrada.id }, data: { fecha: entrada.fecha } });

        if (salida.accion === "crear") {
            await tx.registro.create({ data: salida.data });
        } else if (salida.accion === "actualizar") {
            await tx.registro.update({ where: { id: salida.id }, data: { fecha: salida.fecha } });
        } else if (salida.accion === "eliminar") {
            await tx.registro.delete({ where: { id: salida.id } });
        }
    });

export const eliminarRegistros = (ids) => prisma.registro.deleteMany({ where: { id: { in: ids } } });
