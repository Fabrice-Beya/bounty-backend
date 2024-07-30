/*
  Warnings:

  - The values [SMUGGLING,PIRACY,THEFT,FRAUD] on the enum `BountyCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BountyCategory_new" AS ENUM ('TELEGRAM', 'WHATSAPP', 'WEB', 'CALL_CENTER', 'TEAMS', 'OTHER');
ALTER TABLE "Bounty" ALTER COLUMN "category" TYPE "BountyCategory_new" USING ("category"::text::"BountyCategory_new");
ALTER TYPE "BountyCategory" RENAME TO "BountyCategory_old";
ALTER TYPE "BountyCategory_new" RENAME TO "BountyCategory";
DROP TYPE "BountyCategory_old";
COMMIT;
