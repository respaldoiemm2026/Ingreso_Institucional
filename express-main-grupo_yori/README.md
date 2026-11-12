# API Registro Montessori

API REST (Express + Prisma) para el control de entradas y salidas del personal.

## Puesta en marcha

```bash
npm install
cp .env.example .env        # completar JWT_SECRET y el usuario administrador
npm run db:migrate          # aplica las migraciones (PostgreSQL / Neon)
npm run db:seed             # crea los roles ADMIN y VIGILANTE y el administrador
npm run dev                 # http://localhost:3000 (con recarga automática)
```

## Despliegue en Render

Usa `render.yaml` de la raíz del repo (New → Blueprint, `rootDir: express-main-grupo_yori`) o crea un Web Service con:

- **Build command:** `npm ci && npm run build` (genera el cliente de Prisma y aplica `prisma migrate deploy`)
- **Start command:** `npm start` · **Health check:** `/health`
- **Variables:** `NODE_ENV=production`, `TZ=America/Bogota`, `TRUST_PROXY=2`, `COOKIE_SAMESITE=lax`,
  `JWT_SECRET` (≥ 32 caracteres), `DATABASE_URL` (Neon), `CORS_ORIGIN=https://tu-app.vercel.app,https://tu-app-*.vercel.app`

El primer deploy no crea el administrador: ejecútalo una vez con `npm run db:seed` (Shell de Render o
desde tu equipo con la `DATABASE_URL` de producción).

El frontend llama a la API por el proxy `/api` de Vercel (`vercel.json`), así que la cookie de sesión es
del mismo sitio y `SameSite=Lax` funciona. Si se llama directo a `onrender.com` hay que usar
`COOKIE_SAMESITE=none` (Safari puede bloquearla igual).

Los días (estado, historial, reportes) se calculan en la zona `TZ` (por defecto `America/Bogota`).
Las migraciones antiguas de SQLite quedan en `prisma/migrations_sqlite_antiguas/` solo como referencia.

## Arquitectura

```
src/
├── config/        env.js (valida variables de entorno), constants.js (roles, cargos, tipos)
├── routes/        URL + middlewares de autenticación/autorización
├── controllers/   leen la petición, validan y responden
├── validators/    validan y limpian el body / query
├── services/      reglas de negocio
├── repositories/  acceso a datos con Prisma
├── middleware/    authenticate, authorize(rol), manejo de errores
└── utils/         jwt, fechas, HttpError, asyncHandler
```

Los errores se responden siempre como `{ "message": "..." }`.

El rol del usuario se lee de la base de datos en cada petición: un cambio de rol o una cuenta
eliminada aplica de inmediato. Un administrador no puede eliminarse ni quitarse el rol ADMIN.

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/login` | público (deja la cookie httpOnly `token`) |
| POST | `/auth/logout` | público |
| GET | `/auth/me` | autenticado |
| POST | `/auth/register` | ADMIN |
| CRUD | `/usuario`, `/rol` | ADMIN |
| GET | `/personal?q=&cargo=` | autenticado |
| POST / PUT / DELETE | `/personal[/:id]` | ADMIN y VIGILANTE (DELETE es borrado lógico) |
| POST | `/registro` `{ id_personal, tipo: "ENTRADA" \| "SALIDA" }` | autenticado |
| GET | `/registro?desde=&hasta=&cargo=&id_personal=` | autenticado |
| GET | `/registro/historial?desde=&hasta=&cargo=` | autenticado (entrada y salida emparejadas por día) |
| GET | `/registro/estado/:idPersonal` | autenticado (`ADENTRO` / `AFUERA` hoy) |
| PUT | `/registro/jornada/:entradaId` `{ entrada, salida \| null }` | ADMIN (corrige horas, agrega o quita la salida) |
| DELETE | `/registro/jornada/:entradaId` | ADMIN (borra la entrada y su salida) |
| GET | `/reporte/resumen?fecha=YYYY-MM-DD` | autenticado |

Fechas en formato `YYYY-MM-DD`; `hasta` incluye el día completo. En las correcciones, `entrada` y
`salida` son fechas ISO; el backend exige que queden en el mismo día, sin horas futuras y en orden
con las demás marcas de ese día (ENTRADA, SALIDA, ENTRADA...).
