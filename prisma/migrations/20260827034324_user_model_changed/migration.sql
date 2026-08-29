/*
  Warnings:

  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - Added the required column `phone` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "phone" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "phone";
