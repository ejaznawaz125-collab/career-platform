import { RESUME_AI_PARSER_VERSION, RESUME_EXTRACTOR_VERSION, RESUME_IMPORT_SCHEMA_VERSION } from "./versions";

export type ParseCacheIdentity = { resumeId: string; contentHash: string; extractorVersion: string; parserVersion: string; schemaVersion: string };
export function createParseCacheIdentity(resumeId: string, contentHash: string): ParseCacheIdentity {
  return { resumeId, contentHash, extractorVersion: RESUME_EXTRACTOR_VERSION, parserVersion: RESUME_AI_PARSER_VERSION, schemaVersion: RESUME_IMPORT_SCHEMA_VERSION };
}
export function isReusableParse(candidate: ParseCacheIdentity, expected: ParseCacheIdentity): boolean {
  return candidate.resumeId === expected.resumeId && candidate.contentHash === expected.contentHash && candidate.extractorVersion === expected.extractorVersion && candidate.parserVersion === expected.parserVersion && candidate.schemaVersion === expected.schemaVersion;
}
