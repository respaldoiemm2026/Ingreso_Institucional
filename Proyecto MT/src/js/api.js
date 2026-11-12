import { API_URL } from "./config.js";
import { irA } from "./rutas.js";

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

/**
 * Cliente HTTP único para toda la aplicación.
 * - Envía la cookie de sesión (credentials: "include").
 * - Serializa el body a JSON y omite los parámetros de query vacíos.
 * - Si la sesión expiró (401) redirige al login, salvo con { redirigirSiNoAutenticado: false }.
 */
export async function api(path, { method = "GET", body, query, redirigirSiNoAutenticado = true } = {}) {
    // Se concatena (no new URL(path, base)): un path que empieza con "/" descartaría el "/api" de la base
    const url = new URL(`${API_URL}${path}`);
    Object.entries(query ?? {}).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== "") url.searchParams.set(clave, valor);
    });

    let respuesta;
    try {
        respuesta = await fetch(url, {
            method,
            credentials: "include",
            headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, "No se pudo conectar con el servidor. Si es la primera petición del día puede estar iniciando: espere unos segundos e intente de nuevo.");
    }

    if (respuesta.status === 204) return null;

    const datos = await respuesta.json().catch(() => null);

    // 502/503/504: Render todavía está despertando o la base de datos no responde
    if ([502, 503, 504].includes(respuesta.status)) {
        throw new ApiError(respuesta.status, datos?.message ?? "El servidor se está iniciando. Espere unos segundos e intente de nuevo.");
    }

    if (!respuesta.ok) {
        if (respuesta.status === 401 && redirigirSiNoAutenticado) irA("login");
        throw new ApiError(respuesta.status, datos?.message ?? "Ocurrió un error inesperado");
    }

    return datos;
}
