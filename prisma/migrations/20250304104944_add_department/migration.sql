/*
  Warnings:

  - Added the required column `department` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `department` VARCHAR(191) NOT NULL;
