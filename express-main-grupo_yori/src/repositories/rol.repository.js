import prisma from "../prisma.js";

export const crearRol = (rolData) => prisma.rol.create({ data: rolData });

export const leerRoles = () => prisma.rol.findMany({ orderBy: { name: "asc" } });

export const actualizarRol = (rolId, rolData) =>
    prisma.rol.update({ where: { id: rolId }, data: rolData });

export const eliminarRol = (rolId) => prisma.rol.delete({ where: { id: rolId } });

export const leerRolById = (rolId) => prisma.rol.findUnique({ where: { id: rolId } });
