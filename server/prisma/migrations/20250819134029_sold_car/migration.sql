/*
  Warnings:

  - You are about to alter the column `transmission` on the `car` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `car` MODIFY `transmission` ENUM('AUTO', 'MANUAL') NOT NULL,
    MODIFY `stock` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `SoldCar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `carId` INTEGER NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `fuel` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `transmission` ENUM('AUTO', 'MANUAL') NOT NULL,
    `detail` VARCHAR(1000) NULL,
    `type` ENUM('SEDAN', 'PICKUP4', 'PICKUP', 'MPV') NOT NULL,
    `soldAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
