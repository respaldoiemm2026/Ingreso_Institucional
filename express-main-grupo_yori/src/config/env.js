import "dotenv/config";

// Zona horaria de la institución: los "días" (estado, historial, reportes) se calculan en esta zona.
// Debe fijarse antes de crear cualquier fecha; Render corre en UTC.
process.env.TZ = process.env.TZ || "America/Bogota";

const required = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
}

const nodeEnv = process.env.NODE_ENV ?? "development";

// Render a veces guarda el valor con espacios o saltos de línea al pegarlo
process.env.JWT_SECRET = process.env.JWT_SECRET.trim();
if (nodeEnv === "production" && process.env.JWT_SECRET.length < 32) {
    throw new Error(
        `JWT_SECRET debe tener al menos 32 caracteres en producción (recibidos: ${process.env.JWT_SECRET.length}). ` +
            "Revise la variable en Render → Environment y vuelva a desplegar.",
    );
}

// "lax" cuando el frontend llama a la API por el proxy de Vercel (mismo sitio, recomendado).
// "none" solo si el frontend llama directo a onrender.com (requiere HTTPS; Safari puede bloquearla).
const cookieSameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
if (!["lax", "strict", "none"].includes(cookieSameSite)) {
    throw new Error("COOKIE_SAMESITE debe ser lax, strict o none");
}

export const env = {
    nodeEnv,
    port: Number(process.env.PORT) || 3000,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
    timeZone: process.env.TZ,
    cookieSameSite,
    // Sin "/" final: el navegador envía el Origin sin barra
    corsOrigins: process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean),
};

export const isProduction = env.nodeEnv === "production";
