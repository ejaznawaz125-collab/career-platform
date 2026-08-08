export function assertParseUsable(parse: { status: string; contentHash: string; resumeContentHash: string | null; owned: boolean }): void {
  if (!parse.owned) throw new Error("STALE_OR_UNAUTHORIZED_PARSE");
  if (parse.status !== "READY" || !parse.resumeContentHash || parse.contentHash !== parse.resumeContentHash) throw new Error("STALE_OR_UNAUTHORIZED_PARSE");
}
