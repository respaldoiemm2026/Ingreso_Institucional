import bcrypt from "bcryptjs";
import * as usuarioRepository from "../repositories/usuario.repository.js";
import { leerRolById } from "../repositories/rol.repository.js";
import { ROLES } from "../config/constants.js";
import { badRequest } from "../utils/httpError.js";
import { conMensajeDuplicado, conMensajeRelacionado } from "../utils/prismaErrors.js";

const EMAIL_DUPLICADO = "Ya existe un usuario con ese correo";

const SALT_ROUNDS = 10;

// Convierte "password" en "contrasena" hasheada; nunca se guarda en texto plano
const conPasswordHasheada = async ({ password, ...resto }) => {
    if (password === undefined) return resto;
    return { ...resto, contrasena: await bcrypt.hash(password, SALT_ROUNDS) };
};

const validarRolExiste = async (id_rol) => {
    const rol = await leerRolById(id_rol);
    if (!rol) throw badRequest("El rol seleccionado no existe");
    return rol;
};

export const crearUsuarioService = async (usuarioData) => {
    await validarRolExiste(usuarioData.id_rol);
    const datos = await conPasswordHasheada(usuarioData);
    return conMensajeDuplicado(() => usuarioRepository.crearUsuario(datos), EMAIL_DUPLICADO);
};

export const leerUsuarioService = () => usuarioRepository.leerUsuarios();

// idActual: usuario en sesión. Un administrador no puede quitarse su propio rol ADMIN
export const actualizarUsuarioService = async (usuarioId, usuarioData, idActual) => {
    if (usuarioData.id_rol !== undefined) {
        const rol = await validarRolExiste(usuarioData.id_rol);
        if (usuarioId === idActual && rol.name !== ROLES.ADMIN) {
            throw badRequest("No puede quitarse a sí mismo el rol de administrador");
        }
    }
    const datos = await conPasswordHasheada(usuarioData);
    return conMensajeDuplicado(() => usuarioRepository.actualizarUsuario(usuarioId, datos), EMAIL_DUPLICADO);
};

export const eliminarUsuarioService = async (usuarioId, idActual) => {
    if (usuarioId === idActual) {
        throw badRequest("No puede eliminar su propio usuario");
    }
    await conMensajeRelacionado(
        () => usuarioRepository.eliminarUsuario(usuarioId),
        "No se puede eliminar: el usuario tiene marcas de asistencia registradas",
    );
};
