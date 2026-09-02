/*
  Warnings:

  - You are about to drop the column `profilePhotoUrl` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "profilePhotoUrl";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePhotoPublicId" TEXT,
ADD COLUMN     "profilePhotoUrl" TEXT;
