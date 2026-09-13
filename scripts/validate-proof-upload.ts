import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { buildContactMailto } from "../src/lib/contact";
import { validateProofFile } from "../src/lib/proof/validate";

const prisma = new PrismaClient();

function pngBytes() {
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x2b, 0x25, 0x0d, 0x14, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
}

async function issueSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.authSession.create({
    data: {
      id: createHash("sha256").update(token).digest("hex"),
      userId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  return token;
}

async function main() {
  const textRejected = validateProofFile(new Uint8Array([0x61, 0x62, 0x63]));
  if (textRejected.ok) throw new Error("Text bytes must be rejected.");

  const oversized = validateProofFile(new Uint8Array(10 * 1024 * 1024 + 1));
  if (oversized.ok) throw new Error("Oversized files must be rejected.");

  const png = pngBytes();
  const pngCheck = validateProofFile(png);
  if (!pngCheck.ok || pngCheck.contentType !== "image/png") {
    throw new Error("PNG magic bytes must be accepted.");
  }

  const mailto = buildContactMailto({
    recipient: "task2stock@gmail.com",
    name: "Poku",
    email: "poku@example.com",
    message: "I want to ask about proof uploads and verification.",
  });
  if (
    !mailto.startsWith("mailto:task2stock@gmail.com?") ||
    !mailto.includes(encodeURIComponent("Task2Stock contact from Poku")) ||
    !mailto.includes(
      encodeURIComponent("I want to ask about proof uploads and verification."),
    )
  ) {
    throw new Error(`Unexpected mailto: ${mailto}`);
  }

  const owner = await prisma.user.findFirst({
    where: { email: "phase5@example.com" },
  });
  const other = await prisma.user.findFirst({
    where: { email: { not: "phase5@example.com" } },
  });
  if (!owner || !other) throw new Error("Expected phase5 and a second user.");

  const taskId = "shelf-study";
  const attempt = await prisma.taskAttempt.upsert({
    where: { userId_taskId: { userId: owner.id, taskId } },
    create: {
      id: crypto.randomUUID(),
      userId: owner.id,
      taskId,
      status: "marked_complete",
      checkedStepIndexes: "[]",
      startedAt: new Date(),
      markedCompleteAt: new Date(),
    },
    update: { status: "marked_complete", markedCompleteAt: new Date() },
  });

  const completion = await prisma.taskCompletion.upsert({
    where: { attemptId: attempt.id },
    create: {
      id: crypto.randomUUID(),
      attemptId: attempt.id,
      userId: owner.id,
      taskId,
      markedCompleteAt: new Date(),
    },
    update: {},
  });

  const submissionId = crypto.randomUUID();
  const storageKey = `proofs/${owner.id}/${submissionId}/access.png`;
  const full = path.resolve(process.cwd(), ".data/proofs", storageKey);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(png));

  const existing = await prisma.proofSubmission.findUnique({
    where: { completionId: completion.id },
    include: { verification: true },
  });

  if (existing?.verification?.status === "verified") {
    throw new Error("Do not overwrite a verified proof.");
  }

  const submission = existing
    ? await prisma.proofSubmission.update({
        where: { id: existing.id },
        data: {
          details: "Restored file for access check.",
          fileName: "access.png",
          fileContentType: "image/png",
          fileSize: png.byteLength,
          fileStorageKey: storageKey,
        },
      })
    : await prisma.proofSubmission.create({
        data: {
          id: submissionId,
          completionId: completion.id,
          userId: owner.id,
          taskId,
          details: "Restored file for access check.",
          submittedAt: new Date(),
          fileName: "access.png",
          fileContentType: "image/png",
          fileSize: png.byteLength,
          fileStorageKey: storageKey,
          verification: {
            create: { status: "submitted", updatedAt: new Date() },
          },
        },
      });

  const verification = await prisma.verificationRecord.findUnique({
    where: { submissionId: submission.id },
  });
  if (verification?.status !== "submitted") {
    throw new Error("File metadata must not auto-verify.");
  }

  const anonymous = await fetch(
    `http://localhost:3000/api/proofs/${submission.id}`,
  );
  if (anonymous.status !== 404) {
    throw new Error(`Anonymous access should 404, got ${anonymous.status}`);
  }

  const ownerToken = await issueSession(owner.id);
  const otherToken = await issueSession(other.id);
  const issuedIds = [
    createHash("sha256").update(ownerToken).digest("hex"),
    createHash("sha256").update(otherToken).digest("hex"),
  ];

  const asOwner = await fetch(
    `http://localhost:3000/api/proofs/${submission.id}`,
    { headers: { cookie: `t2s_session=${ownerToken}` } },
  );
  if (asOwner.status !== 200) {
    throw new Error(`Owner should read proof, got ${asOwner.status}`);
  }
  if (asOwner.headers.get("content-type") !== "image/png") {
    throw new Error("Owner response must use stored content type.");
  }

  const asOther = await fetch(
    `http://localhost:3000/api/proofs/${submission.id}`,
    { headers: { cookie: `t2s_session=${otherToken}` } },
  );
  if (asOther.status !== 404) {
    throw new Error(`Other user should 404, got ${asOther.status}`);
  }

  await prisma.authSession.deleteMany({
    where: { id: { in: issuedIds } },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        submissionId: submission.id,
        storageKey,
        size: png.byteLength,
        verification: verification.status,
        mailto,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
