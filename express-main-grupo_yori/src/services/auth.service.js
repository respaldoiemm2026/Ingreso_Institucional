import bcrypt from "bcryptjs";
import { leerUsuarioById, leerUsuarioConCredencialesByEmail } from "../repositories/usuario.repository.js";
import { generateToken } from "../utils/jwt.js";
import { notFound, unauthorized } from "../utils/httpError.js";

// Mismo mensaje para email inexistente y contraseña incorrecta: no revela qué cuentas existen
const CREDENCIALES_INVALIDAS = "Credenciales inválidas";

export const loginUsuario = async ({ email, password }) => {
    const usuario = await leerUsuarioConCredencialesByEmail(email);
    const passwordValida = usuario && (await bcrypt.compare(password, usuario.contrasena));

    if (!passwordValida) {
        throw unauthorized(CREDENCIALES_INVALIDAS);
    }

    const token = generateToken(usuario);
    const { contrasena, ...safeUsuario } = usuario;
    return { token, usuario: safeUsuario };
};

export const usuarioActual = async (id) => {
    const usuario = await leerUsuarioById(id);
    if (!usuario) throw notFound("Usuario no encontrado");
    return usuario;
};
