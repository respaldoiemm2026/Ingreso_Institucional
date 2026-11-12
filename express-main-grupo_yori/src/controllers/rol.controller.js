import {
    actualizarRolService,
    crearRolService,
    eliminarRolService,
    leerRolService,
} from "../services/rol.service.js";
import { validarRol } from "../validators/rol.validator.js";

export const controllerCrearRol = async (req, res) => {
    res.status(201).json(await crearRolService(validarRol(req.body)));
};

export const controllerLeerRol = async (req, res) => {
    res.status(200).json(await leerRolService());
};

export const controllerActualizarRol = async (req, res) => {
    res.status(200).json(await actualizarRolService(req.params.id, validarRol(req.body)));
};

export const controllerEliminarRol = async (req, res) => {
    await eliminarRolService(req.params.id);
    res.status(204).send();
};
