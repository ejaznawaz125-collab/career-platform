export const RESUME_MAX_FILE_SIZE = 10 * 1024 * 1024;

export const RESUME_MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export const RESUME_CATEGORY_OPTIONS = [
  "General",
  "Technical",
  "Executive",
  "Academic",
  "Creative",
  "Career Change",
] as const;

const MANAGED_RESUME_PATH_PATTERN =
  /^resumes\/([a-zA-Z0-9_-]+)\/([a-f0-9-]+)\.(pdf|docx)$/;

export function getResumeExtension(
  filename: string,
): "pdf" | "docx" | null {
  const match = /\.([^.]+)$/.exec(filename.trim().toLowerCase());
  return match?.[1] === "pdf" || match?.[1] === "docx"
    ? match[1]
    : null;
}

export function expectedResumeMimeType(
  extension: "pdf" | "docx",
): string {
  return RESUME_MIME_TYPES[extension];
}

export function isOwnedResumePath(
  pathname: string,
  userId: string,
): boolean {
  return MANAGED_RESUME_PATH_PATTERN.exec(pathname)?.[1] === userId;
}

export function createResumeDownloadUrl(resumeId: string): string {
  return `/api/files/resume/${encodeURIComponent(resumeId)}`;
}

export function deriveResumeTitle(originalName: string): string {
  const title = originalName
    .replace(/\.(pdf|docx)$/i, "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 150);
  return title.length >= 2 ? title : "Resume";
}

export function normalizeResumeTags(tags: string[]): string[] {
  const unique = new Map<string, string>();

  for (const tag of tags) {
    const normalized = tag.trim().replace(/\s+/g, " ");
    if (!normalized) continue;
    unique.set(normalized.toLocaleLowerCase(), normalized);
  }

  return Array.from(unique.values());
}
