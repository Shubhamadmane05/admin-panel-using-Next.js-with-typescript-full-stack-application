/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `PasswordResetToken` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `passwordresettoken` ADD COLUMN `adminId` INTEGER NULL,
    MODIFY `userId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PasswordResetToken_adminId_key` ON `PasswordResetToken`(`adminId`);

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
