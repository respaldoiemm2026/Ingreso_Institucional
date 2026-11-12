import { loginUsuario, usuarioActual } from "../services/auth.service.js";
import { crearUsuarioService } from "../services/usuario.service.js";
import { validarLogin } from "../validators/auth.validator.js";
import { validarUsuario } from "../validators/usuario.validator.js";
import { env, isProduction } from "../config/env.js";
import { tokenMaxAge } from "../utils/jwt.js";

const COOKIE_OPTIONS = {
    httpOnly: true,
    // SameSite=None exige Secure; en producción (HTTPS) siempre va Secure
    secure: isProduction || env.cookieSameSite === "none",
    sameSite: env.cookieSameSite,
};

export const register = async (req, res) => {
    const usuario = await crearUsuarioService(validarUsuario(req.body));
    res.status(201).json(usuario);
};

export const login = async (req, res) => {
    const { token, usuario } = await loginUsuario(validarLogin(req.body));

    // El token solo viaja en la cookie httpOnly: el JavaScript del navegador no puede leerlo
    res.cookie("token", token, { ...COOKIE_OPTIONS, maxAge: tokenMaxAge(token) });
    res.status(200).json({ usuario });
};

export const logout = (req, res) => {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.status(204).send();
};

export const me = async (req, res) => {
    const usuario = await usuarioActual(req.user.sub);
    res.status(200).json({ usuario });
};
