-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('VIP', 'REGULAR', 'OCCASIONAL');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "email" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "type" "ClientType" NOT NULL DEFAULT 'OCCASIONAL';
