/*
  Warnings:

  - A unique constraint covering the columns `[userId,userDepartment]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Notification_userId_userDepartment_key` ON `Notification`(`userId`, `userDepartment`);
