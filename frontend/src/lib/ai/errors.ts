export type AIParserErrorCode = "AI_PROVIDER_UNAVAILABLE" | "AI_TIMEOUT" | "AI_REFUSAL" | "AI_INVALID_OUTPUT" | "AI_SCHEMA_VALIDATION_FAILED" | "TEXT_TOO_LARGE";

export class AIParserError extends Error {
  constructor(public readonly code: AIParserErrorCode) { super(code); this.name = "AIParserError"; }
}

export function mapAIError(error: unknown): AIParserError {
  if (error instanceof AIParserError) return error;
  if (error instanceof Error && error.message === "TEXT_TOO_LARGE") return new AIParserError("TEXT_TOO_LARGE");
  if (error instanceof Error && (error.name === "AbortError" || /timeout/i.test(error.message))) return new AIParserError("AI_TIMEOUT");
  return new AIParserError("AI_PROVIDER_UNAVAILABLE");
}
