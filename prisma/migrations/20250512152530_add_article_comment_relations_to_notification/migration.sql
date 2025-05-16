-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "articleId" TEXT,
ADD COLUMN     "commentId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
