// En desarrollo (Live Server) se llama directo al backend en el puerto 3000, con el mismo
// hostname de la página (localhost o 127.0.0.1) para que el navegador envíe la cookie de sesión.
// En producción (Vercel) se usa el proxy "/api" definido en vercel.json: la API queda en el
// mismo dominio que el frontend y la cookie de sesión funciona en todos los navegadores.
const API_PORT = 3000;
const { hostname, origin } = window.location;
const esLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "";

export const API_URL = esLocal ? `http://${hostname || "localhost"}:${API_PORT}` : `${origin}/api`;
