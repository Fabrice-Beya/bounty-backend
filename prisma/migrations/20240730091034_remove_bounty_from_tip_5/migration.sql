-- CreateEnum
CREATE TYPE "TipPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "priority" "TipPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "reward" DOUBLE PRECISION NOT NULL DEFAULT 0;
