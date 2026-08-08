import { AIParserError, mapAIError } from "./errors";
import { assertAIInputAllowed } from "./policy";
import type { AIProvider } from "./provider";
import { applyResumeSemanticRules } from "./resume-semantic-rules";
import { resumeImportDataSchema, type ResumeImportData } from "@/lib/resume-import/contract";
import { normalizeResumeImportData } from "@/lib/resume-import/normalizer";

export interface ResumeAITransport { generate(text: string): Promise<unknown>; }

export class OpenAIResumeParser implements AIProvider {
  constructor(private readonly transport: ResumeAITransport) {}
  async parseResume(text: string): Promise<ResumeImportData> {
    try {
      assertAIInputAllowed(text);
      const validated = resumeImportDataSchema.safeParse(await this.transport.generate(text));
      if (!validated.success) throw new AIParserError("AI_SCHEMA_VALIDATION_FAILED");
      return applyResumeSemanticRules(text, normalizeResumeImportData(validated.data));
    } catch (error) { throw mapAIError(error); }
  }
}
