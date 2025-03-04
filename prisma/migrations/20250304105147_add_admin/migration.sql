/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `adminId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Notification_userId_key` ON `Notification`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Notification_adminId_key` ON `Notification`(`adminId`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
