-- CreateTable
CREATE TABLE "HarajUser" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordEncrypted" TEXT NOT NULL,
    "postIds" TEXT[],
    "scheduleTime" TEXT NOT NULL,
    "lastRunDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HarajUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HarajUser_username_key" ON "HarajUser"("username");
