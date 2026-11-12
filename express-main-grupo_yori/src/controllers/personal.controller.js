import {
    actualizarPersonalService,
    crearPersonalService,
    eliminarPersonalService,
    leerPersonalService,
} from "../services/personal.service.js";
import { validarFiltrosPersonal, validarPersonal } from "../validators/personal.validator.js";

export const controllerCrearPersonal = async (req, res) => {
    res.status(201).json(await crearPersonalService(validarPersonal(req.body)));
};

export const controllerLeerPersonal = async (req, res) => {
    res.status(200).json(await leerPersonalService(validarFiltrosPersonal(req.query)));
};

export const controllerActualizarPersonal = async (req, res) => {
    const personal = await actualizarPersonalService(req.params.id, validarPersonal(req.body, { parcial: true }));
    res.status(200).json(personal);
};

export const controllerEliminarPersonal = async (req, res) => {
    await eliminarPersonalService(req.params.id);
    res.status(204).send();
};
