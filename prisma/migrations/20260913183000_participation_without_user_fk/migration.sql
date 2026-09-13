-- Drop User FKs on participation tables so attempts can use a
-- participant key without creating a User row. Add one attempt per
-- (userId, taskId).

PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaskAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "checkedStepIndexes" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "markedCompleteAt" DATETIME,
    CONSTRAINT "TaskAttempt_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TaskAttempt" ("checkedStepIndexes", "id", "markedCompleteAt", "startedAt", "status", "taskId", "userId") SELECT "checkedStepIndexes", "id", "markedCompleteAt", "startedAt", "status", "taskId", "userId" FROM "TaskAttempt";
DROP TABLE "TaskAttempt";
ALTER TABLE "new_TaskAttempt" RENAME TO "TaskAttempt";
CREATE INDEX "TaskAttempt_userId_idx" ON "TaskAttempt"("userId");
CREATE INDEX "TaskAttempt_taskId_idx" ON "TaskAttempt"("taskId");
CREATE UNIQUE INDEX "TaskAttempt_userId_taskId_key" ON "TaskAttempt"("userId", "taskId");
CREATE TABLE "new_TaskCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "markedCompleteAt" DATETIME NOT NULL,
    CONSTRAINT "TaskCompletion_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TaskAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TaskCompletion" ("attemptId", "id", "markedCompleteAt", "taskId", "userId") SELECT "attemptId", "id", "markedCompleteAt", "taskId", "userId" FROM "TaskCompletion";
DROP TABLE "TaskCompletion";
ALTER TABLE "new_TaskCompletion" RENAME TO "TaskCompletion";
CREATE UNIQUE INDEX "TaskCompletion_attemptId_key" ON "TaskCompletion"("attemptId");
CREATE INDEX "TaskCompletion_userId_idx" ON "TaskCompletion"("userId");
CREATE INDEX "TaskCompletion_taskId_idx" ON "TaskCompletion"("taskId");
CREATE TABLE "new_ProofSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "completionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL,
    CONSTRAINT "ProofSubmission_completionId_fkey" FOREIGN KEY ("completionId") REFERENCES "TaskCompletion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProofSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProofSubmission" ("completionId", "details", "id", "submittedAt", "taskId", "userId") SELECT "completionId", "details", "id", "submittedAt", "taskId", "userId" FROM "ProofSubmission";
DROP TABLE "ProofSubmission";
ALTER TABLE "new_ProofSubmission" RENAME TO "ProofSubmission";
CREATE UNIQUE INDEX "ProofSubmission_completionId_key" ON "ProofSubmission"("completionId");
CREATE INDEX "ProofSubmission_userId_idx" ON "ProofSubmission"("userId");
CREATE INDEX "ProofSubmission_taskId_idx" ON "ProofSubmission"("taskId");
PRAGMA foreign_keys=ON;
