import prisma from "../prisma.js";

export const crearPersonal = (data) => prisma.personal.create({ data });

export const leerPersonal = ({ q, cargo } = {}) =>
    prisma.personal.findMany({
        where: {
            activo: true,
            cargo,
            ...(q && {
                OR: [{ nombre: { contains: q } }, { documento: { contains: q } }],
            }),
        },
        orderBy: { nombre: "asc" },
    });

export const leerPersonalById = (id) => prisma.personal.findUnique({ where: { id } });

export const leerPersonalByDocumento = (documento) => prisma.personal.findUnique({ where: { documento } });

export const contarPersonalActivo = () => prisma.personal.count({ where: { activo: true } });

export const actualizarPersonal = (id, data) => prisma.personal.update({ where: { id }, data });
