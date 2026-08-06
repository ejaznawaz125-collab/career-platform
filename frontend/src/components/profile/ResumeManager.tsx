"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Resume = {
  id: string;
  title: string;
  fileUrl: string;
  originalName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  version: number;
  isDefault: boolean;
  isPublic: boolean;
  atsScore: number | null;
  createdAt: string;
  updatedAt: string;
};

type ResumeFormData = {
  title: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  fileSize: string;
  version: string;
  isDefault: boolean;
  isPublic: boolean;
  atsScore: string;
};

type ResumeApiResponse = {
  success: boolean;
  message?: string;
  resumes?: Resume[];
  resume?: Resume;
  errors?: Record<string, string[] | undefined>;
};

const initialFormData: ResumeFormData = {
  title: "",
  fileUrl: "",
  originalName: "",
  mimeType: "application/pdf",
  fileSize: "",
  version: "1",
  isDefault: false,
  isPublic: false,
  atsScore: "",
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClassName =
  "block text-sm font-semibold text-slate-700";

function nullableInteger(
  value: string,
): number | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isSafeInteger(parsedValue)
    ? parsedValue
    : null;
}

function optionalText(
  value: string,
): string | null {
  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function formatFileSize(
  fileSize: number | null,
): string {
  if (
    fileSize === null ||
    fileSize < 0
  ) {
    return "Size not available";
  }

  if (fileSize < 1024) {
    return `${fileSize} B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${(
      fileSize / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    fileSize /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function getErrorMessage(
  result: ResumeApiResponse,
  fallbackMessage: string,
): string {
  const validationMessage =
    result.errors
      ? Object.values(
          result.errors,
        )
          .flatMap(
            (messages) =>
              messages ?? [],
          )
          .find(Boolean)
      : undefined;

  return (
    validationMessage ||
    result.message ||
    fallbackMessage
  );
}

export default function ResumeManager() {
  const [resumes, setResumes] =
    useState<Resume[]>([]);

  const [formData, setFormData] =
    useState<ResumeFormData>(
      initialFormData,
    );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadResumes =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          "/api/profile/resumes",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as ResumeApiResponse;

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load resumes.",
          );
        }

        setResumes(
          result.resumes ?? [],
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load resumes.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadResumes();
  }, [loadResumes]);

  function resetForm() {
    setEditingId(null);
    setFormData(initialFormData);
  }

  function handleChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
    >,
  ) {
    const target = event.target;

    const name =
      target.name as keyof ResumeFormData;

    if (
      target instanceof
        HTMLInputElement &&
      target.type === "checkbox"
    ) {
      setFormData((current) => ({
        ...current,
        [name]: target.checked,
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: target.value,
    }));
  }

  function handleEdit(
    resume: Resume,
  ) {
    setEditingId(resume.id);

    setFormData({
      title: resume.title,
      fileUrl: resume.fileUrl,
      originalName:
        resume.originalName ?? "",
      mimeType:
        resume.mimeType ??
        "application/pdf",
      fileSize:
        resume.fileSize !== null
          ? String(
              resume.fileSize,
            )
          : "",
      version: String(
        resume.version,
      ),
      isDefault:
        resume.isDefault,
      isPublic:
        resume.isPublic,
      atsScore:
        resume.atsScore !== null
          ? String(
              resume.atsScore,
            )
          : "",
    });

    setMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const payload = {
        ...(editingId
          ? {
              id: editingId,
            }
          : {}),

        title:
          formData.title,

        fileUrl:
          formData.fileUrl,

        originalName:
          optionalText(
            formData.originalName,
          ),

        mimeType:
          optionalText(
            formData.mimeType,
          ),

        fileSize:
          nullableInteger(
            formData.fileSize,
          ),

        version:
          Number(
            formData.version,
          ),

        isDefault:
          formData.isDefault,

        isPublic:
          formData.isPublic,

        atsScore:
          nullableInteger(
            formData.atsScore,
          ),
      };

      const response = await fetch(
        "/api/profile/resumes",
        {
          method: editingId
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload,
          ),
        },
      );

      const result =
        (await response.json()) as ResumeApiResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          getErrorMessage(
            result,
            editingId
              ? "Failed to update resume."
              : "Failed to add resume.",
          ),
        );
      }

      setMessage(
        result.message ||
          (editingId
            ? "Resume updated successfully."
            : "Resume added successfully."),
      );

      resetForm();

      await loadResumes();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save resume.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this resume?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/resumes",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id,
          }),
        },
      );

      const result =
        (await response.json()) as ResumeApiResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to delete resume.",
        );
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        result.message ||
          "Resume deleted successfully.",
      );

      await loadResumes();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete resume.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Resumes
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add and manage your resume
          records. Actual file upload
          support will be connected in
          the next resume-upload step.
        </p>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700"
        >
          {message}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label
            className={`${labelClassName} sm:col-span-2`}
          >
            Resume Title

            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={150}
              placeholder="Warehouse Supervisor Resume"
              className={inputClassName}
            />
          </label>

          <label
            className={`${labelClassName} sm:col-span-2`}
          >
            Resume File URL

            <input
              required
              type="url"
              name="fileUrl"
              value={
                formData.fileUrl
              }
              onChange={handleChange}
              placeholder="https://example.com/resume.pdf"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Original File Name

            <input
              type="text"
              name="originalName"
              value={
                formData.originalName
              }
              onChange={handleChange}
              placeholder="ejaz-nawaz-resume.pdf"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            File Type

            <select
              name="mimeType"
              value={
                formData.mimeType
              }
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="application/pdf">
                PDF
              </option>

              <option value="application/msword">
                DOC
              </option>

              <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                DOCX
              </option>
            </select>
          </label>

          <label className={labelClassName}>
            File Size in Bytes

            <input
              type="number"
              min="0"
              name="fileSize"
              value={
                formData.fileSize
              }
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Version

            <input
              required
              type="number"
              min="1"
              name="version"
              value={
                formData.version
              }
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            ATS Score

            <input
              type="number"
              min="0"
              max="100"
              name="atsScore"
              value={
                formData.atsScore
              }
              onChange={handleChange}
              placeholder="85"
              className={inputClassName}
            />
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="isDefault"
              checked={
                formData.isDefault
              }
              onChange={handleChange}
              className="h-5 w-5 rounded border-slate-300 text-blue-600"
            />

            <span>
              Make this my default
              resume
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="isPublic"
              checked={
                formData.isPublic
              }
              onChange={handleChange}
              className="h-5 w-5 rounded border-slate-300 text-blue-600"
            />

            <span>
              Show this resume on my
              public profile
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Resume"
                : "Add Resume"}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
            Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center">
            <h3 className="font-semibold text-slate-800">
              No resumes added
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add your first resume to
              complete your candidate
              profile.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map(
              (resume) => (
                <article
                  key={resume.id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {resume.title}
                        </h3>

                        {resume.isDefault ? (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            Default
                          </span>
                        ) : null}

                        {resume.isPublic ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Public
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Version{" "}
                        {resume.version}
                        {" · "}
                        {formatFileSize(
                          resume.fileSize,
                        )}
                        {" · "}
                        Updated{" "}
                        {formatDate(
                          resume.updatedAt,
                        )}
                      </p>

                      {resume.originalName ? (
                        <p className="mt-2 break-all text-sm text-slate-600">
                          {
                            resume.originalName
                          }
                        </p>
                      ) : null}

                      {resume.atsScore !==
                      null ? (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-600">
                              ATS Score
                            </span>

                            <span className="font-bold text-blue-700">
                              {
                                resume.atsScore
                              }
                              %
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${resume.atsScore}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      <a
                        href={
                          resume.fileUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-green-700"
                      >
                        View
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            resume,
                          )
                        }
                        className="text-sm font-semibold text-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          resume.id
                        }
                        onClick={() =>
                          void handleDelete(
                            resume.id,
                          )
                        }
                        className="text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId ===
                        resume.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}