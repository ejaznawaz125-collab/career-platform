"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Skill = {
  id: string;
  name: string;
  category: string | null;
  level: number;
  years: string | number | null;
  featured: boolean;
};

type SkillFormData = {
  name: string;
  category: string;
  level: string;
  years: string;
  featured: boolean;
};

type SkillsResponse = {
  success: boolean;
  message?: string;
  skills?: Skill[];
  skill?: Skill;
  errors?: Record<string, string[] | undefined>;
};

const initialFormData: SkillFormData = {
  name: "",
  category: "",
  level: "1",
  years: "",
  featured: false,
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClassName =
  "block text-sm font-semibold text-slate-700";

function getErrorMessage(
  result: SkillsResponse,
  fallback: string,
): string {
  const validationMessage = result.errors
    ? Object.values(result.errors)
        .flatMap((values) => values ?? [])
        .find(Boolean)
    : undefined;

  return validationMessage || result.message || fallback;
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formData, setFormData] =
    useState<SkillFormData>(initialFormData);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/skills",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result =
        (await response.json()) as SkillsResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load skills.",
        );
      }

      setSkills(result.skills ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load skills.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSkills();
  }, [loadSkills]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingId(null);
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const target = event.target;
    const name =
      target.name as keyof SkillFormData;

    if (
      target instanceof HTMLInputElement &&
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

  function handleEdit(skill: Skill) {
    setEditingId(skill.id);

    setFormData({
      name: skill.name,
      category: skill.category ?? "",
      level: String(skill.level),
      years:
        skill.years !== null
          ? String(skill.years)
          : "",
      featured: skill.featured,
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
        ...(editingId ? { id: editingId } : {}),
        name: formData.name,
        category: formData.category || null,
        level: Number(formData.level),
        years:
          formData.years.trim() === ""
            ? null
            : Number(formData.years),
        featured: formData.featured,
      };

      const response = await fetch(
        "/api/profile/skills",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result =
        (await response.json()) as SkillsResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(
            result,
            editingId
              ? "Failed to update skill."
              : "Failed to add skill.",
          ),
        );
      }

      setMessage(
        result.message ||
          (editingId
            ? "Skill updated successfully."
            : "Skill added successfully."),
      );

      resetForm();
      await loadSkills();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save skill.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/skills",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        },
      );

      const result =
        (await response.json()) as SkillsResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete skill.",
        );
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        result.message ||
          "Skill deleted successfully.",
      );

      await loadSkills();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete skill.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Skills
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Add your professional and technical skills.
        </p>
      </div>

      {errorMessage ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {message ? (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {message}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Skill Name
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Inventory Management"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Category
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Warehouse Operations"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Skill Level
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="1">Beginner</option>
              <option value="2">Basic</option>
              <option value="3">Intermediate</option>
              <option value="4">Advanced</option>
              <option value="5">Expert</option>
            </select>
          </label>

          <label className={labelClassName}>
            Years of Experience
            <input
              type="number"
              min="0"
              max="99.9"
              step="0.1"
              name="years"
              value={formData.years}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-300"
          />

          Feature this skill
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Skill"
                : "Add Skill"}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-slate-600">
            Loading skills...
          </p>
        ) : skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No skills added yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {skills.map((skill) => (
              <article
                key={skill.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">
                        {skill.name}
                      </h3>

                      {skill.featured ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      ) : null}
                    </div>

                    {skill.category ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {skill.category}
                      </p>
                    ) : null}

                    <p className="mt-3 text-sm text-slate-600">
                      Level: {skill.level}/5
                      {skill.years !== null
                        ? ` · ${skill.years} years`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(skill)}
                    className="text-sm font-semibold text-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === skill.id}
                    onClick={() =>
                      void handleDelete(skill.id)
                    }
                    className="text-sm font-semibold text-red-600 disabled:opacity-60"
                  >
                    {deletingId === skill.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}