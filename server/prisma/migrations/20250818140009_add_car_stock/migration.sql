/*
  Warnings:

  - You are about to drop the `resetpasswordtoken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `resetpasswordtoken` DROP FOREIGN KEY `ResetPasswordToken_userId_fkey`;

-- AlterTable
ALTER TABLE `car` ADD COLUMN `stock` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `resetpasswordtoken`;
