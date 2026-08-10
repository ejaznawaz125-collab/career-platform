import "server-only";

import { getAuthenticatedCandidateOwner } from "@/lib/candidate-server";

export type AuthenticatedResumeOwner = {
  userId: string;
  profileId: string;
};

export async function getAuthenticatedResumeOwner(): Promise<
  AuthenticatedResumeOwner | null
> {
  return getAuthenticatedCandidateOwner();
}
