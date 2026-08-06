"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type CandidateLanguage = {
  id: string;
  language: string;
  proficiency:
    | "BASIC"
    | "CONVERSATIONAL"
    | "PROFESSIONAL"
    | "FLUENT"
    | "NATIVE";
  isNative: boolean;
  createdAt: string;
  updatedAt: string;
};

type LanguageFormData = {
  language: string;
  proficiency:
    | "BASIC"
    | "CONVERSATIONAL"
    | "PROFESSIONAL"
    | "FLUENT"
    | "NATIVE";
  isNative: boolean;
};

type LanguagesApiResponse = {
  success: boolean;
  message?: string;
  count?: number;
  languages?: CandidateLanguage[];
  language?: CandidateLanguage;
  errors?: Record<string, string[] | undefined>;
};

const initialFormData: LanguageFormData = {
  language: "",
  proficiency: "CONVERSATIONAL",
  isNative: false,
};

const proficiencyOptions: Array<{
  value: LanguageFormData["proficiency"];
  label: string;
}> = [
  {
    value: "BASIC",
    label: "Basic",
  },
  {
    value: "CONVERSATIONAL",
    label: "Conversational",
  },
  {
    value: "PROFESSIONAL",
    label: "Professional",
  },
  {
    value: "FLUENT",
    label: "Fluent",
  },
  {
    value: "NATIVE",
    label: "Native",
  },
];

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClassName =
  "block text-sm font-semibold text-slate-700";

function formatProficiency(
  proficiency: CandidateLanguage["proficiency"],
): string {
  return proficiency
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function getErrorMessage(
  result: LanguagesApiResponse,
  fallbackMessage: string,
): string {
  const validationMessage = result.errors
    ? Object.values(result.errors)
        .flatMap((messages) => messages ?? [])
        .find(Boolean)
    : undefined;

  return (
    validationMessage ||
    result.message ||
    fallbackMessage
  );
}

export default function LanguagesManager() {
  const [languages, setLanguages] = useState<
    CandidateLanguage[]
  >([]);

  const [formData, setFormData] =
    useState<LanguageFormData>(initialFormData);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadLanguages = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/languages",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result =
        (await response.json()) as LanguagesApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load languages.",
        );
      }

      setLanguages(result.languages ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load languages.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLanguages();
  }, [loadLanguages]);

  function resetForm() {
    setEditingId(null);
    setFormData(initialFormData);
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const target = event.target;
    const name =
      target.name as keyof LanguageFormData;

    if (
      target instanceof HTMLInputElement &&
      target.type === "checkbox"
    ) {
      const checked = target.checked;

      setFormData((current) => ({
        ...current,
        [name]: checked,
        ...(name === "isNative" && checked
          ? {
              proficiency: "NATIVE",
            }
          : {}),
      }));

      return;
    }

    if (name === "proficiency") {
      const proficiency =
        target.value as LanguageFormData["proficiency"];

      setFormData((current) => ({
        ...current,
        proficiency,
        isNative: proficiency === "NATIVE",
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: target.value,
    }));
  }

  function handleEdit(
    language: CandidateLanguage,
  ) {
    setEditingId(language.id);

    setFormData({
      language: language.language,
      proficiency: language.proficiency,
      isNative: language.isNative,
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
        language: formData.language,
        proficiency: formData.isNative
          ? "NATIVE"
          : formData.proficiency,
        isNative: formData.isNative,
      };

      const response = await fetch(
        "/api/profile/languages",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result =
        (await response.json()) as LanguagesApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(
            result,
            editingId
              ? "Failed to update language."
              : "Failed to add language.",
          ),
        );
      }

      setMessage(
        result.message ||
          (editingId
            ? "Language updated successfully."
            : "Language added successfully."),
      );

      resetForm();
      await loadLanguages();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save language.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this language?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/languages",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        },
      );

      const result =
        (await response.json()) as LanguagesApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to delete language.",
        );
      }

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        result.message ||
          "Language deleted successfully.",
      );

      await loadLanguages();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete language.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Languages
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add the languages you can speak and select
          your proficiency level.
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
          <label className={labelClassName}>
            Language
            <input
              required
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="English"
              maxLength={100}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Proficiency
            <select
              name="proficiency"
              value={formData.proficiency}
              onChange={handleChange}
              disabled={formData.isNative}
              className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
            >
              {proficiencyOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="isNative"
            checked={formData.isNative}
            onChange={handleChange}
            className="h-5 w-5 rounded border-slate-300 text-blue-600"
          />

          <span>This is my native language</span>
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
                ? "Update Language"
                : "Add Language"}
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
              Loading languages...
            </p>
          </div>
        ) : languages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center">
            <h3 className="font-semibold text-slate-800">
              No languages added
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add the languages that you can
              communicate in.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {languages.map((language) => (
              <article
                key={language.id}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {language.language}
                      </h3>

                      {language.isNative ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Native
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {language.isNative
                        ? "Native speaker"
                        : formatProficiency(
                            language.proficiency,
                          )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(language)
                      }
                      className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingId === language.id
                      }
                      onClick={() =>
                        void handleDelete(
                          language.id,
                        )
                      }
                      className="text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === language.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width:
                        language.isNative ||
                        language.proficiency ===
                          "NATIVE"
                          ? "100%"
                          : language.proficiency ===
                              "FLUENT"
                            ? "85%"
                            : language.proficiency ===
                                "PROFESSIONAL"
                              ? "70%"
                              : language.proficiency ===
                                  "CONVERSATIONAL"
                                ? "50%"
                                : "25%",
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}