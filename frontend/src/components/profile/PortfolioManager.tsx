"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type PortfolioProject = {
  id: string;
  title: string;
  description: string | null;
  projectUrl: string | null;
  githubUrl: string | null;
  imageUrl: string | null;
  technologies: string[];
  startDate: string | null;
  endDate: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type PortfolioFormData = {
  title: string;
  description: string;
  projectUrl: string;
  githubUrl: string;
  imageUrl: string;
  technologies: string;
  startDate: string;
  endDate: string;
  featured: boolean;
};

type PortfolioApiResponse = {
  success: boolean;
  message?: string;
  count?: number;
  projects?: PortfolioProject[];
  project?: PortfolioProject;
  errors?: Record<string, string[] | undefined>;
};

const initialFormData: PortfolioFormData = {
  title: "",
  description: "",
  projectUrl: "",
  githubUrl: "",
  imageUrl: "",
  technologies: "",
  startDate: "",
  endDate: "",
  featured: false,
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClassName =
  "block text-sm font-semibold text-slate-700";

function optionalText(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function toDateInputValue(
  value: string | null,
): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function parseTechnologies(
  value: string,
): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((technology) =>
          technology.trim(),
        )
        .filter(Boolean),
    ),
  );
}

function getErrorMessage(
  result: PortfolioApiResponse,
  fallbackMessage: string,
): string {
  const validationMessage = result.errors
    ? Object.values(result.errors)
        .flatMap(
          (messages) => messages ?? [],
        )
        .find(Boolean)
    : undefined;

  return (
    validationMessage ||
    result.message ||
    fallbackMessage
  );
}

export default function PortfolioManager() {
  const [projects, setProjects] = useState<
    PortfolioProject[]
  >([]);

  const [formData, setFormData] =
    useState<PortfolioFormData>(
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

  const loadProjects =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          "/api/profile/portfolio",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as PortfolioApiResponse;

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load portfolio projects.",
          );
        }

        setProjects(
          result.projects ?? [],
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load portfolio projects.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  function resetForm() {
    setEditingId(null);
    setFormData(initialFormData);
  }

  function handleChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
    >,
  ) {
    const target = event.target;
    const name =
      target.name as keyof PortfolioFormData;

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
    project: PortfolioProject,
  ) {
    setEditingId(project.id);

    setFormData({
      title: project.title,
      description:
        project.description ?? "",
      projectUrl:
        project.projectUrl ?? "",
      githubUrl:
        project.githubUrl ?? "",
      imageUrl:
        project.imageUrl ?? "",
      technologies:
        project.technologies.join(", "),
      startDate: toDateInputValue(
        project.startDate,
      ),
      endDate: toDateInputValue(
        project.endDate,
      ),
      featured: project.featured,
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

        title: formData.title,

        description: optionalText(
          formData.description,
        ),

        projectUrl: optionalText(
          formData.projectUrl,
        ),

        githubUrl: optionalText(
          formData.githubUrl,
        ),

        imageUrl: optionalText(
          formData.imageUrl,
        ),

        technologies:
          parseTechnologies(
            formData.technologies,
          ),

        startDate:
          formData.startDate || null,

        endDate:
          formData.endDate || null,

        featured:
          formData.featured,
      };

      const response = await fetch(
        "/api/profile/portfolio",
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
        (await response.json()) as PortfolioApiResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          getErrorMessage(
            result,
            editingId
              ? "Failed to update portfolio project."
              : "Failed to add portfolio project.",
          ),
        );
      }

      setMessage(
        result.message ||
          (editingId
            ? "Portfolio project updated successfully."
            : "Portfolio project added successfully."),
      );

      resetForm();
      await loadProjects();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save portfolio project.",
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
        "Are you sure you want to delete this portfolio project?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/portfolio",
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
        (await response.json()) as PortfolioApiResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to delete portfolio project.",
        );
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        result.message ||
          "Portfolio project deleted successfully.",
      );

      await loadProjects();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete portfolio project.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Portfolio Projects
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add professional projects,
          portfolio links, technologies,
          and GitHub repositories.
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
            Project Title
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={200}
              placeholder="Career Platform"
              className={inputClassName}
            />
          </label>

          <label
            className={`${labelClassName} sm:col-span-2`}
          >
            Description
            <textarea
              name="description"
              rows={6}
              value={
                formData.description
              }
              onChange={handleChange}
              maxLength={5000}
              placeholder="Explain the project, your role, and its key features."
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Live Project URL
            <input
              type="url"
              name="projectUrl"
              value={
                formData.projectUrl
              }
              onChange={handleChange}
              placeholder="https://example.com"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            GitHub URL
            <input
              type="url"
              name="githubUrl"
              value={
                formData.githubUrl
              }
              onChange={handleChange}
              placeholder="https://github.com/username/project"
              className={inputClassName}
            />
          </label>

          <label
            className={`${labelClassName} sm:col-span-2`}
          >
            Project Image URL
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/project-image.jpg"
              className={inputClassName}
            />
          </label>

          <label
            className={`${labelClassName} sm:col-span-2`}
          >
            Technologies
            <input
              type="text"
              name="technologies"
              value={
                formData.technologies
              }
              onChange={handleChange}
              placeholder="Next.js, TypeScript, Prisma, PostgreSQL"
              className={inputClassName}
            />

            <span className="mt-2 block text-xs font-normal text-slate-500">
              Separate technologies with
              commas.
            </span>
          </label>

          <label className={labelClassName}>
            Start Date
            <input
              type="date"
              name="startDate"
              value={
                formData.startDate
              }
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            End Date
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="featured"
            checked={
              formData.featured
            }
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-300 text-blue-600"
          />

          <span>
            Feature this project on my
            public profile
          </span>
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Project"
                : "Add Project"}
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
            <p className="text-sm text-slate-600">
              Loading portfolio
              projects...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center">
            <h3 className="font-semibold text-slate-800">
              No portfolio projects
              added
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add your best projects to
              strengthen your candidate
              profile.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map(
              (project) => (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 transition hover:border-slate-300 hover:shadow-sm"
                >
                  {project.imageUrl ? (
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={
                          project.imageUrl
                        }
                        alt={
                          project.title
                        }
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {
                              project.title
                            }
                          </h3>

                          {project.featured ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Featured
                            </span>
                          ) : null}
                        </div>

                        {(project.startDate ||
                          project.endDate) ? (
                          <p className="mt-2 text-sm text-slate-500">
                            {formatDate(
                              project.startDate,
                            )}
                            {" — "}
                            {formatDate(
                              project.endDate,
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {project.description ? (
                      <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {
                          project.description
                        }
                      </p>
                    ) : null}

                    {project.technologies
                      .length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.technologies.map(
                          (
                            technology,
                          ) => (
                            <span
                              key={
                                technology
                              }
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                            >
                              {
                                technology
                              }
                            </span>
                          ),
                        )}
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-4">
                      {project.projectUrl ? (
                        <a
                          href={
                            project.projectUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                        >
                          View Project
                        </a>
                      ) : null}

                      {project.githubUrl ? (
                        <a
                          href={
                            project.githubUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                        >
                          GitHub
                        </a>
                      ) : null}
                    </div>

                    <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            project,
                          )
                        }
                        className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          project.id
                        }
                        onClick={() =>
                          void handleDelete(
                            project.id,
                          )
                        }
                        className="text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId ===
                        project.id
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