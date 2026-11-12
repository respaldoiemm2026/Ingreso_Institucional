import { texto } from "./common.js";

export const validarRol = (body) => ({
    name: texto(body.name, "name", { max: 40 }).toUpperCase(),
});
