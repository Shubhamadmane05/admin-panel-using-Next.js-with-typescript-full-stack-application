/*
  Warnings:

  - You are about to drop the column `adminId` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `notification` table. All the data in the column will be lost.
  - Added the required column `userDepartment` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userEmail` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `notification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropIndex
DROP INDEX `Notification_adminId_key` ON `notification`;

-- DropIndex
DROP INDEX `Notification_userId_key` ON `notification`;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `adminId`,
    DROP COLUMN `department`,
    DROP COLUMN `message`,
    ADD COLUMN `userDepartment` VARCHAR(191) NOT NULL,
    ADD COLUMN `userEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `userName` VARCHAR(191) NOT NULL,
    MODIFY `userId` INTEGER NOT NULL;
