-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Yarn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "yarnId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Cones',
    "costPerCone" REAL NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 50,
    "location" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Yarn" ("color", "createdAt", "id", "location", "material", "name", "quantity", "supplier", "updatedAt", "yarnId") SELECT "color", "createdAt", "id", "location", "material", "name", "quantity", "supplier", "updatedAt", "yarnId" FROM "Yarn";
DROP TABLE "Yarn";
ALTER TABLE "new_Yarn" RENAME TO "Yarn";
CREATE UNIQUE INDEX "Yarn_yarnId_key" ON "Yarn"("yarnId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
