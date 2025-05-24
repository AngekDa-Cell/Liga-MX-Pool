-- CreateTable
CREATE TABLE "QuinielaSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "predictions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuinielaSubmission_pkey" PRIMARY KEY ("id")
);
