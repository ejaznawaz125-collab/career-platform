"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Experience = {
  id: string;
  company: string;
  companyLogo: string | null;
  position: string;
  employmentType: string | null;
  industry: string | null;
  location: string | null;
  country: string | null;
  startDate: string;
  endDate: string | null;
  currentlyWorking: boolean;
  description: string | null;
  achievements: string | null;
};

type ExperienceFormData = {
  company: string;
  companyLogo: string;
  position: string;
  employmentType: string;
  industry: string;
  location: string;
  country: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  achievements: string;
};

type ExperienceResponse = {
  success: boolean;
  message?: string;
  experiences?: Experience[];
  experience?: Experience;
  errors?: Record<string, string[] | undefined>;
};

const initialFormData: ExperienceFormData = {
  company: "",
  companyLogo: "",
  position: "",
  employmentType: "",
  industry: "",
  location: "",
  country: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
  achievements: "",
};

const employmentTypes = [
  { value: "", label: "Select employment type" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
  {
    value: "APPRENTICESHIP",
    label: "Apprenticeship",
  },
  {
    value: "SELF_EMPLOYED",
    label: "Self Employed",
  },
];

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClassName =
  "block text-sm font-semibold text-slate-700";

function optionalText(
  value: string,
): string | null {
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(
  result: ExperienceResponse,
  fallback: string,
): string {
  const validationMessage = result.errors
    ? Object.values(result.errors)
        .flatMap((values) => values ?? [])
        .find(Boolean)
    : undefined;

  return validationMessage || result.message || fallback;
}

export default function ExperienceManager() {
  const [experiences, setExperiences] =
    useState<Experience[]>([]);

  const [formData, setFormData] =
    useState<ExperienceFormData>(initialFormData);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/experience",
        {
          cache: "no-store",
        },
      );

      const result =
        (await response.json()) as ExperienceResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load experience.",
        );
      }

      setExperiences(result.experiences ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load experience.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExperiences();
  }, [loadExperiences]);

  function resetForm() {
    setEditingId(null);
    setFormData(initialFormData);
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >,
  ) {
    const target = event.target;
    const name =
      target.name as keyof ExperienceFormData;

    if (
      target instanceof HTMLInputElement &&
      target.type === "checkbox"
    ) {
      setFormData((current) => ({
        ...current,
        [name]: target.checked,
        ...(name === "currentlyWorking" &&
        target.checked
          ? { endDate: "" }
          : {}),
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: target.value,
    }));
  }

  function handleEdit(experience: Experience) {
    setEditingId(experience.id);

    setFormData({
      company: experience.company,
      companyLogo: experience.companyLogo ?? "",
      position: experience.position,
      employmentType:
        experience.employmentType ?? "",
      industry: experience.industry ?? "",
      location: experience.location ?? "",
      country: experience.country ?? "",
      startDate: toDateInputValue(
        experience.startDate,
      ),
      endDate: toDateInputValue(
        experience.endDate,
      ),
      currentlyWorking:
        experience.currentlyWorking,
      description:
        experience.description ?? "",
      achievements:
        experience.achievements ?? "",
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
        company: formData.company,
        companyLogo: optionalText(
          formData.companyLogo,
        ),
        position: formData.position,
        employmentType:
          formData.employmentType || null,
        industry: optionalText(formData.industry),
        location: optionalText(formData.location),
        country: optionalText(formData.country),
        startDate: formData.startDate,
        endDate: formData.currentlyWorking
          ? null
          : formData.endDate || null,
        currentlyWorking:
          formData.currentlyWorking,
        description: optionalText(
          formData.description,
        ),
        achievements: optionalText(
          formData.achievements,
        ),
      };

      const response = await fetch(
        "/api/profile/experience",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result =
        (await response.json()) as ExperienceResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(
            result,
            editingId
              ? "Failed to update experience."
              : "Failed to add experience.",
          ),
        );
      }

      setMessage(
        result.message ||
          "Experience saved successfully.",
      );

      resetForm();
      await loadExperiences();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save experience.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/experience",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        },
      );

      const result =
        (await response.json()) as ExperienceResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to delete experience.",
        );
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        result.message ||
          "Experience deleted successfully.",
      );

      await loadExperiences();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete experience.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-slate-950">
        Experience
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Add your employment history and achievements.
      </p>

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
            Company
            <input
              required
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Position
            <input
              required
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Employment Type
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className={inputClassName}
            >
              {employmentTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClassName}>
            Industry
            <input
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Location
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Country
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Start Date
            <input
              required
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            End Date
            <input
              type="date"
              name="endDate"
              disabled={formData.currentlyWorking}
              value={formData.endDate}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={`${labelClassName} sm:col-span-2`}>
            Company Logo URL
            <input
              type="url"
              name="companyLogo"
              value={formData.companyLogo}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="currentlyWorking"
            checked={formData.currentlyWorking}
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-300"
          />

          I currently work here
        </label>

        <label
          className={`${labelClassName} mt-5`}
        >
          Description
          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label
          className={`${labelClassName} mt-5`}
        >
          Achievements
          <textarea
            name="achievements"
            rows={5}
            value={formData.achievements}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Experience"
                : "Add Experience"}
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

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-600">
            Loading experience...
          </p>
        ) : experiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No experience records added yet.
          </div>
        ) : (
          experiences.map((experience) => (
            <article
              key={experience.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <h3 className="text-lg font-bold text-slate-900">
                {experience.position}
              </h3>

              <p className="mt-1 font-medium text-blue-700">
                {experience.company}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {formatDate(experience.startDate)}
                {" — "}
                {experience.currentlyWorking
                  ? "Present"
                  : experience.endDate
                    ? formatDate(
                        experience.endDate,
                      )
                    : "Not specified"}
              </p>

              {experience.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {experience.description}
                </p>
              ) : null}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleEdit(experience)
                  }
                  className="text-sm font-semibold text-blue-700"
                >
                  Edit
                </button>

                <button
                  type="button"
                  disabled={
                    deletingId === experience.id
                  }
                  onClick={() =>
                    void handleDelete(experience.id)
                  }
                  className="text-sm font-semibold text-red-600 disabled:opacity-60"
                >
                  {deletingId === experience.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}