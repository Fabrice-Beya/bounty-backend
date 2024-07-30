/*
  Warnings:

  - You are about to drop the column `bountyId` on the `Tip` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_bountyId_fkey";

-- AlterTable
ALTER TABLE "Tip" DROP COLUMN "bountyId";
