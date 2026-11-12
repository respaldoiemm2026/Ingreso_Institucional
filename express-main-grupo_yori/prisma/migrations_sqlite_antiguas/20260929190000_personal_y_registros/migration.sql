-- Los registros anteriores (campo "accion" libre, ligados al usuario) no pueden
-- convertirse al nuevo formato ENTRADA/SALIDA por persona del personal.
DELETE FROM "Registro";

-- CreateTable
CREATE TABLE "Personal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "area" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Registro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_personal" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Registro_id_personal_fkey" FOREIGN KEY ("id_personal") REFERENCES "Personal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Registro_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "Registro";
ALTER TABLE "new_Registro" RENAME TO "Registro";
CREATE INDEX "Registro_id_personal_fecha_idx" ON "Registro"("id_personal", "fecha");
CREATE INDEX "Registro_fecha_idx" ON "Registro"("fecha");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Personal_documento_key" ON "Personal"("documento");

