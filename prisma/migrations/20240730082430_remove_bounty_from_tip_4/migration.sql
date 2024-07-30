-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_userId_fkey";

-- AlterTable
ALTER TABLE "Tip" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
