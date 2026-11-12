import * as rolRepository from "../repositories/rol.repository.js";

export const crearRolService = (rolData) => rolRepository.crearRol(rolData);

export const leerRolService = () => rolRepository.leerRoles();

export const actualizarRolService = (rolId, rolData) => rolRepository.actualizarRol(rolId, rolData);

export const eliminarRolService = (rolId) => rolRepository.eliminarRol(rolId);
