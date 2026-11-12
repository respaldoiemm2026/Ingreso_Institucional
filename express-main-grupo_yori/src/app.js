import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env, isProduction } from "./config/env.js";
import auth from "./routes/auth.route.js";
import usuario from "./routes/usuario.route.js";
import rol from "./routes/rol.route.js";
import personal from "./routes/personal.route.js";
import registro from "./routes/registro.route.js";
import reporte from "./routes/reporte.route.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

// Origen permitido: los de CORS_ORIGIN. Una entrada con "*" (p. ej. https://mi-app-*.vercel.app)
// acepta también los deploys de preview de Vercel.
const patron = (origen) => new RegExp(`^${origen.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[a-z0-9-]+")}$`, "i");
const ORIGENES = env.corsOrigins.map(patron);

// En desarrollo se acepta cualquier puerto local (Live Server usa 5501, 5502… si 5500 está ocupado)
const ORIGEN_LOCAL = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const origenPermitido = (origin, callback) => {
    const permitido = !origin || ORIGENES.some((re) => re.test(origin)) || (!isProduction && ORIGEN_LOCAL.test(origin));
    callback(null, permitido);
};

// Proxies delante de la API, para que req.ip sea la IP real del cliente (lo usa el rate limit):
// 1 = solo Render; 2 = proxy de Vercel + Render (TRUST_PROXY=2 en Render)
app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use(cors({ origin: origenPermitido, credentials: true }));
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Frena ataques de fuerza bruta contra el login: 10 intentos por IP cada 15 minutos
app.use(
    "/auth/login",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        message: { message: "Demasiados intentos de inicio de sesión. Intente de nuevo en unos minutos." },
    }),
);

app.use("/auth", auth);
app.use("/usuario", usuario);
app.use("/rol", rol);
app.use("/personal", personal);
app.use("/registro", registro);
app.use("/reporte", reporte);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
