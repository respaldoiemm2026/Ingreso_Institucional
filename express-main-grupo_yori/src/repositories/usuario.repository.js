import prisma from "../prisma.js";

// Campos seguros: nunca se expone la contraseña fuera de auth
const USUARIO_PUBLICO = {
    id: true,
    nombre: true,
    email: true,
    id_rol: true,
    rol: { select: { id: true, name: true } },
};

export const crearUsuario = (usuarioData) =>
    prisma.usuario.create({ data: usuarioData, select: USUARIO_PUBLICO });

// Incluye la contraseña: solo para verificar credenciales
export const leerUsuarioConCredencialesByEmail = (email) =>
    prisma.usuario.findUnique({ where: { email }, include: { rol: true } });

export const leerUsuarioById = (id) =>
    prisma.usuario.findUnique({ where: { id }, select: USUARIO_PUBLICO });

export const leerUsuarios = () =>
    prisma.usuario.findMany({ select: USUARIO_PUBLICO, orderBy: { nombre: "asc" } });

export const actualizarUsuario = (usuarioId, usuarioData) =>
    prisma.usuario.update({ where: { id: usuarioId }, data: usuarioData, select: USUARIO_PUBLICO });

export const eliminarUsuario = (usuarioId) =>
    prisma.usuario.delete({ where: { id: usuarioId } });
