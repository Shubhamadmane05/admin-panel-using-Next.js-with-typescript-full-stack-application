/*
  Warnings:

  - Made the column `role` on table `admin` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `admin` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE `user` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'user';
