import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./config/env.js";

// PostgreSQL (Neon en producción). DATABASE_URL="postgresql://usuario:clave@host/db?sslmode=require"
const adapter = new PrismaPg({ connectionString: env.databaseUrl });

const prisma = new PrismaClient({ adapter });

export default prisma;
