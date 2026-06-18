-- CreateTable
CREATE TABLE "Yarn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "yarnId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "yarnId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "Yarn" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Yarn_yarnId_key" ON "Yarn"("yarnId");
