-- CreateTable
CREATE TABLE "wishlists" (
    "email" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE INDEX "wishlists_email_idx" ON "wishlists"("email");
