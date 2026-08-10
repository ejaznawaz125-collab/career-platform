import "server-only";

import { UserRole } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AuthenticatedCandidateOwner = {
  userId: string;
  profileId: string;
};

export async function getAuthenticatedCandidateOwner(): Promise<AuthenticatedCandidateOwner | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      candidateProfile: { select: { id: true } },
    },
  });

  if (!user) return null;
  if (user.role !== UserRole.USER) return null;

  if (user.candidateProfile) {
    return { userId: user.id, profileId: user.candidateProfile.id };
  }

  // USER is the candidate-registration role. Existing accounts created before
  // candidate profiles became transactional are repaired idempotently.
  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  });

  return { userId: user.id, profileId: candidateProfile.id };
}
