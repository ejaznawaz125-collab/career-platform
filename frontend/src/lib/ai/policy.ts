export const AI_REQUEST_POLICY = {
  maximumInputCharacters: 150_000,
  timeoutMilliseconds: 30_000,
  maximumRetries: 1,
  maximumOutputTokens: 12_000,
} as const;

export function assertAIInputAllowed(text: string): void {
  if (!text.trim()) throw new Error("AI_INVALID_INPUT");
  if (text.length > AI_REQUEST_POLICY.maximumInputCharacters) throw new Error("TEXT_TOO_LARGE");
}
