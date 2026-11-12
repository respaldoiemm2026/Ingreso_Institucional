import bcrypt from "bcryptjs";
import prisma from "../src/prisma.js";
import { ROLES } from "../src/config/constants.js";

const main = async () => {
    for (const name of Object.values(ROLES)) {
        await prisma.rol.upsert({ where: { name }, update: {}, create: { name } });
    }

    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE = "Administrador" } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log("Roles creados. Defina ADMIN_EMAIL y ADMIN_PASSWORD para crear el administrador.");
        return;
    }

    const rolAdmin = await prisma.rol.findUnique({ where: { name: ROLES.ADMIN } });
    // update vacío: si el admin ya existe no se le cambia la contraseña
    await prisma.usuario.upsert({
        where: { email: ADMIN_EMAIL.toLowerCase() },
        update: {},
        create: {
            nombre: ADMIN_NOMBRE,
            email: ADMIN_EMAIL.toLowerCase(),
            contrasena: await bcrypt.hash(ADMIN_PASSWORD, 10),
            id_rol: rolAdmin.id,
        },
    });
    console.log(`Roles y administrador (${ADMIN_EMAIL}) listos.`);
};

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
