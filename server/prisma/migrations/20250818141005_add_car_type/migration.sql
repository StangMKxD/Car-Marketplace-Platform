/*
  Warnings:

  - The values [SUV,HEV] on the enum `Car_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `car` MODIFY `type` ENUM('SEDAN', 'PICKUP4', 'PICKUP', 'MPV') NOT NULL,
    MODIFY `stock` INTEGER NOT NULL DEFAULT 0;
