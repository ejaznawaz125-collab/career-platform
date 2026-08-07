const PROFILE_PHOTO_PATH_PATTERN =
  /^profile-photos\/([a-zA-Z0-9_-]+)\/([a-f0-9-]+)\.(?:webp|jpg)$/;

const PROFILE_PHOTO_DELIVERY_PATH =
  "/api/files/profile-photo";

export function createProfilePhotoReference(
  pathname: string,
): string {
  return `${PROFILE_PHOTO_DELIVERY_PATH}?pathname=${encodeURIComponent(pathname)}`;
}

export function parseManagedProfilePhotoReference(
  reference: string | null | undefined,
): string | null {
  if (!reference) {
    return null;
  }

  try {
    const url = new URL(reference, "http://career-platform.local");

    if (url.origin !== "http://career-platform.local") {
      return null;
    }

    if (url.pathname !== PROFILE_PHOTO_DELIVERY_PATH) {
      return null;
    }

    const pathname = url.searchParams.get("pathname");

    if (!pathname || !isProfilePhotoPathname(pathname)) {
      return null;
    }

    return pathname;
  } catch {
    return null;
  }
}

export function isProfilePhotoPathname(
  pathname: string,
): boolean {
  return PROFILE_PHOTO_PATH_PATTERN.test(pathname);
}

export function isOwnedProfilePhotoPathname(
  pathname: string,
  userId: string,
): boolean {
  const match = PROFILE_PHOTO_PATH_PATTERN.exec(pathname);

  return match?.[1] === userId;
}
