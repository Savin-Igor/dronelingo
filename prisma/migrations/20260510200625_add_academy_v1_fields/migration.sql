-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "blocks" JSONB;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "cognitiveLevel" TEXT,
ADD COLUMN     "distractorRationales" JSONB,
ADD COLUMN     "lessonSectionRef" TEXT,
ADD COLUMN     "scenarioType" TEXT;
