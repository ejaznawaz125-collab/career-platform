import "server-only";

import { del } from "@vercel/blob";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isOwnedProfilePhotoPathname,
  parseManagedProfilePhotoReference,
} from "@/lib/profile-photo";

export type AuthenticatedPhotoUser = {
  id: string;
  image: string | null;
};

export async function getAuthenticatedPhotoUser(): Promise<
  AuthenticatedPhotoUser | null
> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      image: true,
    },
  });
}

export async function deleteManagedProfilePhoto(
  reference: string | null,
  userId: string,
): Promise<void> {
  const pathname = parseManagedProfilePhotoReference(reference);

  if (
    !pathname ||
    !isOwnedProfilePhotoPathname(pathname, userId)
  ) {
    return;
  }

  await del(pathname);
}

type ReplaceProfilePhotoOptions = {
  user: AuthenticatedPhotoUser;
  nextImage: string;
  newBlobPathname?: string;
};

export async function replaceProfilePhotoReference({
  user,
  nextImage,
  newBlobPathname,
}: ReplaceProfilePhotoOptions): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: {
      id: user.id,
      image: user.image,
    },
    data: {
      image: nextImage,
    },
  });

  if (result.count !== 1) {
    if (newBlobPathname) {
      await del(newBlobPathname);
    }

    return false;
  }

  try {
    await deleteManagedProfilePhoto(user.image, user.id);
  } catch (cleanupError) {
    console.error(
      "PROFILE_PHOTO_REPLACEMENT_CLEANUP_ERROR:",
      cleanupError,
    );
  }

  return true;
}

export async function removeProfilePhotoReference(
  user: AuthenticatedPhotoUser,
): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: {
      id: user.id,
      image: user.image,
    },
    data: {
      image: null,
    },
  });

  if (result.count !== 1) {
    return false;
  }

  try {
    await deleteManagedProfilePhoto(user.image, user.id);
  } catch (cleanupError) {
    console.error(
      "PROFILE_PHOTO_DELETE_CLEANUP_ERROR:",
      cleanupError,
    );
  }

  return true;
}
