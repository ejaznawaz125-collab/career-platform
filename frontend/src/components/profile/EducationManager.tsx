"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Education = {
  id: string;
  institute: string;
  degree: string;
  fieldOfStudy: string | null;
  educationLevel: string;
  country: string | null;
  city: string | null;
  startYear: number | null;
  endYear: number | null;
  currentlyStudying: boolean;
  grade: string | null;
  description: string | null;
};

type EducationFormData = {
  institute: string;
  degree: string;
  fieldOfStudy: string;
  educationLevel: string;
  country: string;
  city: string;
  startYear: string;
  endYear: string;
  currentlyStudying: boolean;
  grade: string;
  description: string;
};

type EducationResponse = {
  success: boolean;
  message?: string;
  educations?: Education[];
  education?: Education;
  errors?: Record<string, string[] | undefined>;
};

const initialFormData: EducationFormData = {
  institute: "",
  degree: "",
  fieldOfStudy: "",
  educationLevel: "BACHELOR",
  country: "",
  city: "",
  startYear: "",
  endYear: "",
  currentlyStudying: false,
  grade: "",
  description: "",
};

const educationLevels = [
  { value: "MATRIC", label: "Matric" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "BACHELOR", label: "Bachelor" },
  { value: "MASTER", label: "Master" },
  { value: "MPHIL", label: "MPhil" },
  { value: "PHD", label: "PhD" },
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

function optionalNumber(
  value: string,
): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

function getErrorMessage(
  result: EducationResponse,
  fallback: string,
): string {
  const validationMessage = result.errors
    ? Object.values(result.errors)
        .flatMap((values) => values ?? [])
        .find(Boolean)
    : undefined;

  return validationMessage || result.message || fallback;
}

export default function EducationManager() {
  const [educations, setEducations] = useState<
    Education[]
  >([]);

  const [formData, setFormData] =
    useState<EducationFormData>(initialFormData);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadEducations = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/education",
        {
          cache: "no-store",
        },
      );

      const result =
        (await response.json()) as EducationResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load education records.",
        );
      }

      setEducations(result.educations ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load education records.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEducations();
  }, [loadEducations]);

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
      target.name as keyof EducationFormData;

    if (
      target instanceof HTMLInputElement &&
      target.type === "checkbox"
    ) {
      setFormData((current) => ({
        ...current,
        [name]: target.checked,
        ...(name === "currentlyStudying" &&
        target.checked
          ? { endYear: "" }
          : {}),
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: target.value,
    }));
  }

  function handleEdit(education: Education) {
    setEditingId(education.id);

    setFormData({
      institute: education.institute,
      degree: education.degree,
      fieldOfStudy:
        education.fieldOfStudy ?? "",
      educationLevel:
        education.educationLevel,
      country: education.country ?? "",
      city: education.city ?? "",
      startYear:
        education.startYear !== null
          ? String(education.startYear)
          : "",
      endYear:
        education.endYear !== null
          ? String(education.endYear)
          : "",
      currentlyStudying:
        education.currentlyStudying,
      grade: education.grade ?? "",
      description:
        education.description ?? "",
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
        institute: formData.institute,
        degree: formData.degree,
        fieldOfStudy: optionalText(
          formData.fieldOfStudy,
        ),
        educationLevel:
          formData.educationLevel,
        country: optionalText(formData.country),
        city: optionalText(formData.city),
        startYear: optionalNumber(
          formData.startYear,
        ),
        endYear: formData.currentlyStudying
          ? null
          : optionalNumber(formData.endYear),
        currentlyStudying:
          formData.currentlyStudying,
        grade: optionalText(formData.grade),
        description: optionalText(
          formData.description,
        ),
      };

      const response = await fetch(
        "/api/profile/education",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result =
        (await response.json()) as EducationResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(
            result,
            editingId
              ? "Failed to update education."
              : "Failed to add education.",
          ),
        );
      }

      setMessage(
        result.message ||
          "Education saved successfully.",
      );

      resetForm();
      await loadEducations();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save education.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this education record?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/education",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        },
      );

      const result =
        (await response.json()) as EducationResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to delete education.",
        );
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        result.message ||
          "Education deleted successfully.",
      );

      await loadEducations();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete education.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-slate-950">
        Education
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Add your academic qualifications.
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
            Institute
            <input
              required
              name="institute"
              value={formData.institute}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Degree
            <input
              required
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Field of Study
            <input
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Education Level
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              className={inputClassName}
            >
              {educationLevels.map((level) => (
                <option
                  key={level.value}
                  value={level.value}
                >
                  {level.label}
                </option>
              ))}
            </select>
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
            City
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Start Year
            <input
              type="number"
              min="1900"
              name="startYear"
              value={formData.startYear}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            End Year
            <input
              type="number"
              min="1900"
              name="endYear"
              disabled={formData.currentlyStudying}
              value={formData.endYear}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Grade
            <input
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="currentlyStudying"
            checked={formData.currentlyStudying}
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-300"
          />

          Currently studying
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

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Education"
                : "Add Education"}
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
            Loading education...
          </p>
        ) : educations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No education records added yet.
          </div>
        ) : (
          educations.map((education) => (
            <article
              key={education.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <h3 className="text-lg font-bold text-slate-900">
                {education.degree}
              </h3>

              <p className="mt-1 font-medium text-blue-700">
                {education.institute}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {education.startYear ??
                  "Not specified"}{" "}
                —{" "}
                {education.currentlyStudying
                  ? "Present"
                  : education.endYear ??
                    "Not specified"}
              </p>

              {education.fieldOfStudy ? (
                <p className="mt-2 text-sm text-slate-600">
                  {education.fieldOfStudy}
                </p>
              ) : null}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleEdit(education)
                  }
                  className="text-sm font-semibold text-blue-700"
                >
                  Edit
                </button>

                <button
                  type="button"
                  disabled={
                    deletingId === education.id
                  }
                  onClick={() =>
                    void handleDelete(education.id)
                  }
                  className="text-sm font-semibold text-red-600 disabled:opacity-60"
                >
                  {deletingId === education.id
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