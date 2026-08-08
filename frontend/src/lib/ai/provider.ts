import type { ResumeImportData } from "@/lib/resume-import/contract";

export interface AIProvider {
  parseResume(text: string): Promise<ResumeImportData>;
}
