import {
    actualizarUsuarioService,
    crearUsuarioService,
    eliminarUsuarioService,
    leerUsuarioService,
} from "../services/usuario.service.js";
import { validarUsuario } from "../validators/usuario.validator.js";

export const controllerCrearUsuario = async (req, res) => {
    const usuario = await crearUsuarioService(validarUsuario(req.body));
    res.status(201).json(usuario);
};

export const controllerLeerUsuario = async (req, res) => {
    res.status(200).json(await leerUsuarioService());
};

export const controllerActualizarUsuario = async (req, res) => {
    const datos = validarUsuario(req.body, { parcial: true });
    const usuario = await actualizarUsuarioService(req.params.id, datos, req.user.sub);
    res.status(200).json(usuario);
};

export const controllerEliminarUsuario = async (req, res) => {
    await eliminarUsuarioService(req.params.id, req.user.sub);
    res.status(204).send();
};
