"use client";

import { put } from "@vercel/blob/client";
import {
  Download,
  FileText,
  LoaderCircle,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  expectedResumeMimeType,
  getResumeExtension,
  RESUME_CATEGORY_OPTIONS,
  RESUME_MAX_FILE_SIZE,
} from "@/lib/resume";
import ResumeImportReview from "./ResumeImportReview";

type ResumeRecord = {
  id: string;
  title: string;
  originalName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  version: number;
  versionGroupId: string | null;
  categoryTags: string[];
  uploadStatus: "LEGACY" | "READY";
  isDefault: boolean;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  resumes?: ResumeRecord[];
  resume?: ResumeRecord;
  pathname?: string;
  token?: string;
};

function formatSize(bytes: number | null): string {
  if (bytes === null) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMessage(data: ApiResponse, fallback: string): string {
  return data.message?.trim() || fallback;
}

function TagSelector({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [customTag, setCustomTag] = useState("");

  function toggle(tag: string) {
    onChange(tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]);
  }

  function addCustomTag() {
    const tag = customTag.trim().replace(/\s+/g, " ");
    if (!tag || tags.some((item) => item.toLowerCase() === tag.toLowerCase())) return;
    if (tags.length >= 12) return;
    onChange([...tags, tag]);
    setCustomTag("");
  }

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-700">Categories</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {RESUME_CATEGORY_OPTIONS.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={tags.includes(category)}
            onClick={() => toggle(category)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
              tags.includes(category)
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-blue-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {tags.filter((tag) => !RESUME_CATEGORY_OPTIONS.some((option) => option === tag)).length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags
            .filter((tag) => !RESUME_CATEGORY_OPTIONS.some((option) => option === tag))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                aria-label={`Remove ${tag} category`}
              >
                {tag} <X size={14} aria-hidden="true" />
              </button>
            ))}
        </div>
      ) : null}

      <div className="mt-3 flex max-w-md gap-2">
        <input
          value={customTag}
          maxLength={40}
          onChange={(event) => setCustomTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomTag();
            }
          }}
          placeholder="Custom category"
          aria-label="Custom resume category"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={addCustomTag}
          disabled={!customTag.trim() || tags.length >= 12}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </fieldset>
  );
}

export default function ResumeManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ResumeRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [categoryTags, setCategoryTags] = useState<string[]>(["General"]);
  const [versionGroupId, setVersionGroupId] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadResumes = useCallback(async () => {
    try {
      const response = await fetch("/api/profile/resumes", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.success) {
        throw new Error(getMessage(data, "Failed to load resumes."));
      }
      setResumes(data.resumes ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResumes();
  }, [loadResumes]);

  function selectFile(file: File | undefined) {
    if (!file) return;
    const extension = getResumeExtension(file.name);
    if (
      !extension ||
      (file.type !== "" && file.type !== expectedResumeMimeType(extension)) ||
      file.size === 0 ||
      file.size > RESUME_MAX_FILE_SIZE
    ) {
      setSelectedFile(null);
      setError("Choose a valid PDF or DOCX file up to 10 MB.");
      return;
    }

    setError("");
    setSelectedFile(file);
    if (!title.trim()) setTitle(file.name.replace(/\.(pdf|docx)$/i, ""));
  }

  function resetUploadForm() {
    setSelectedFile(null);
    setTitle("");
    setCategoryTags(["General"]);
    setVersionGroupId("");
    setIsDefault(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile || uploading) return;

    let pendingPathname: string | null = null;

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const extension = getResumeExtension(selectedFile.name);
      if (!extension) throw new Error("Choose a valid PDF or DOCX file.");
      const mimeType = expectedResumeMimeType(extension);

      const tokenResponse = await fetch("/api/upload/resume/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalName: selectedFile.name,
          mimeType,
          fileSize: selectedFile.size,
        }),
      });
      const tokenData = (await tokenResponse.json()) as ApiResponse;
      if (!tokenResponse.ok || !tokenData.success || !tokenData.pathname || !tokenData.token) {
        throw new Error(getMessage(tokenData, "Failed to prepare resume upload."));
      }
      pendingPathname = tokenData.pathname;

      await put(tokenData.pathname, selectedFile, {
        access: "private",
        token: tokenData.token,
        contentType: mimeType,
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      });

      const finalizeResponse = await fetch("/api/upload/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathname: tokenData.pathname,
          title,
          originalName: selectedFile.name,
          mimeType,
          fileSize: selectedFile.size,
          categoryTags,
          isDefault,
          versionGroupId: versionGroupId || null,
        }),
      });
      const finalizeData = (await finalizeResponse.json()) as ApiResponse;
      if (!finalizeResponse.ok || !finalizeData.success) {
        throw new Error(getMessage(finalizeData, "Failed to save resume."));
      }

      setMessage(getMessage(finalizeData, "Resume uploaded securely."));
      pendingPathname = null;
      resetUploadForm();
      await loadResumes();
    } catch (uploadError) {
      if (pendingPathname) {
        await fetch("/api/upload/resume", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathname: pendingPathname }),
        }).catch(() => undefined);
      }
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    try {
      setError("");
      const response = await fetch("/api/profile/resumes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          title: editing.title,
          categoryTags: editing.categoryTags,
          ...(editing.isDefault ? { isDefault: true } : {}),
        }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.success) {
        throw new Error(getMessage(data, "Failed to update resume."));
      }
      setEditing(null);
      setMessage(getMessage(data, "Resume updated."));
      await loadResumes();
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Failed to update resume.");
    }
  }

  async function deleteResume(resume: ResumeRecord) {
    if (!window.confirm(`Delete “${resume.title}”? This cannot be undone.`)) return;
    try {
      setDeletingId(resume.id);
      setError("");
      const response = await fetch("/api/profile/resumes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resume.id }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.success) {
        throw new Error(getMessage(data, "Failed to delete resume."));
      }
      setMessage(getMessage(data, "Resume deleted securely."));
      await loadResumes();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete resume.");
    } finally {
      setDeletingId(null);
    }
  }

  const versionGroups = Array.from(
    resumes
      .filter((resume) => resume.versionGroupId && resume.uploadStatus === "READY")
      .reduce((groups, resume) => {
        const current = groups.get(resume.versionGroupId!);
        if (!current || resume.version > current.version) {
          groups.set(resume.versionGroupId!, resume);
        }
        return groups;
      }, new Map<string, ResumeRecord>())
      .values(),
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><FileText size={24} /></div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Resumes</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Store multiple PDF or DOCX resumes securely. Files remain private and downloads require authentication.
          </p>
        </div>
      </div>

      {error ? <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div> : null}
      {message ? <div role="status" className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">{message}</div> : null}

      <form onSubmit={handleUpload} className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <h3 className="font-bold text-slate-900">Upload a resume</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Resume file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => selectFile(event.target.files?.[0])}
              disabled={uploading}
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
            />
            <span className="mt-1 block text-xs text-slate-500">PDF or DOCX, maximum 10 MB.</span>
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Title</span>
            <input required minLength={2} maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100" />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">Version</span>
            <select value={versionGroupId} onChange={(event) => setVersionGroupId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100">
              <option value="">New resume (version 1)</option>
              {versionGroups.map((resume) => (
                <option key={resume.versionGroupId} value={resume.versionGroupId ?? ""}>
                  New version of {resume.title} (currently v{resume.version})
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2"><TagSelector tags={categoryTags} onChange={setCategoryTags} /></div>

          <label className="flex items-center gap-3 sm:col-span-2">
            <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} className="size-4 accent-blue-600" />
            <span className="text-sm font-medium text-slate-700">Make this my default resume</span>
          </label>
        </div>

        {uploading ? (
          <div className="mt-5" aria-live="polite">
            <div className="flex justify-between text-xs font-semibold text-slate-600"><span>Uploading securely</span><span>{uploadProgress}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${uploadProgress}%` }} /></div>
          </div>
        ) : null}

        <button type="submit" disabled={!selectedFile || uploading} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}
          {uploading ? "Uploading…" : "Upload resume"}
        </button>
      </form>

      <ResumeImportReview resumes={resumes} onImported={loadResumes} />

      <div className="mt-8">
        <h3 className="font-bold text-slate-900">Your resumes</h3>
        {loading ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={17} /> Loading resumes…</p>
        ) : resumes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No resumes uploaded yet.</div>
        ) : (
          <div className="mt-4 space-y-4">
            {resumes.map((resume) => (
              <article key={resume.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900">{resume.title}</h4>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">v{resume.version}</span>
                      {resume.isDefault ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><Star size={12} /> Default</span> : null}
                      {resume.uploadStatus === "READY" ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"><ShieldCheck size={12} /> Private</span> : <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">Legacy URL</span>}
                    </div>
                    <p className="mt-2 break-all text-sm text-slate-600">{resume.originalName ?? "Resume"} · {formatSize(resume.fileSize)}</p>
                    {resume.categoryTags.length ? <div className="mt-3 flex flex-wrap gap-2">{resume.categoryTags.map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{tag}</span>)}</div> : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a href={resume.downloadUrl} target={resume.uploadStatus === "LEGACY" ? "_blank" : undefined} rel={resume.uploadStatus === "LEGACY" ? "noreferrer" : undefined} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"><Download size={15} /> Download</a>
                    <button type="button" onClick={() => setEditing({ ...resume })} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Pencil size={15} /> Edit</button>
                    <button type="button" onClick={() => void deleteResume(resume)} disabled={deletingId === resume.id} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">{deletingId === resume.id ? <LoaderCircle className="animate-spin" size={15} /> : <Trash2 size={15} />} Delete</button>
                  </div>
                </div>

                {editing?.id === resume.id ? (
                  <form onSubmit={saveEdit} className="mt-5 border-t border-slate-200 pt-5">
                    <label className="block max-w-lg"><span className="text-sm font-semibold text-slate-700">Title</span><input required minLength={2} maxLength={150} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" /></label>
                    <div className="mt-4"><TagSelector tags={editing.categoryTags} onChange={(tags) => setEditing({ ...editing, categoryTags: tags })} /></div>
                    {!editing.isDefault ? <label className="mt-4 flex items-center gap-3"><input type="checkbox" onChange={(event) => setEditing({ ...editing, isDefault: event.target.checked })} className="size-4 accent-blue-600" /><span className="text-sm font-medium text-slate-700">Make default</span></label> : null}
                    <div className="mt-4 flex gap-3"><button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Save</button><button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button></div>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
