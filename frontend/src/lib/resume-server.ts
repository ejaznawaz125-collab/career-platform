import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AuthenticatedResumeOwner = {
  userId: string;
  profileId: string;
};

export async function getAuthenticatedResumeOwner(): Promise<
  AuthenticatedResumeOwner | null
> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      candidateProfile: { select: { id: true } },
    },
  });

  if (!user?.candidateProfile) return null;
  return { userId: user.id, profileId: user.candidateProfile.id };
}
