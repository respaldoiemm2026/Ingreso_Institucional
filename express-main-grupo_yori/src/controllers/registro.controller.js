import {
    corregirJornadaService,
    crearRegistroService,
    eliminarJornadaService,
    leerHistorialService,
    leerRegistroService,
    obtenerEstadoService,
} from "../services/registro.service.js";
import {
    validarCorreccionJornada,
    validarFiltrosRegistro,
    validarNuevoRegistro,
} from "../validators/registro.validator.js";

export const controllerCrearRegistro = async (req, res) => {
    // El usuario que marca sale del token, nunca del body
    const registro = await crearRegistroService(validarNuevoRegistro(req.body), req.user.sub);
    res.status(201).json(registro);
};

export const controllerLeerRegistro = async (req, res) => {
    res.status(200).json(await leerRegistroService(validarFiltrosRegistro(req.query)));
};

export const controllerHistorial = async (req, res) => {
    res.status(200).json(await leerHistorialService(validarFiltrosRegistro(req.query)));
};

export const controllerEstado = async (req, res) => {
    res.status(200).json(await obtenerEstadoService(req.params.idPersonal));
};

export const controllerCorregirJornada = async (req, res) => {
    await corregirJornadaService(req.params.id, validarCorreccionJornada(req.body), req.user.sub);
    res.status(204).send();
};

export const controllerEliminarJornada = async (req, res) => {
    await eliminarJornadaService(req.params.id);
    res.status(204).send();
};
