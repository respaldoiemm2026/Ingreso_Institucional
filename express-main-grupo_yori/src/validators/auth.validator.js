import { email, texto } from "./common.js";

export const validarLogin = (body) => ({
    email: email(body.email),
    password: texto(body.password, "password"),
});
