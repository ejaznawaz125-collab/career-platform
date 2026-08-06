"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type SlugApiResponse = {
  success: boolean;
  message?: string;
  slug?: string | null;
  isPublic?: boolean;
  publicUrl?: string | null;
  errors?: Record<string, string[] | undefined>;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function getErrorMessage(
  result: SlugApiResponse,
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

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PublicProfileSettings() {
  const [slug, setSlug] = useState("");
  const [publicUrl, setPublicUrl] =
    useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/slug",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result =
        (await response.json()) as SlugApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load public profile settings.",
        );
      }

      setSlug(result.slug ?? "");
      setPublicUrl(result.publicUrl ?? null);
      setIsPublic(result.isPublic ?? false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load public profile settings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function handleSlugChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setSlug(normalizeSlug(event.target.value));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/slug",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug,
          }),
        },
      );

      const result =
        (await response.json()) as SlugApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(
            result,
            "Failed to update public profile link.",
          ),
        );
      }

      setSlug(result.slug ?? slug);
      setPublicUrl(result.publicUrl ?? null);

      setMessage(
        result.message ||
          "Public profile link updated successfully.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update public profile link.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm text-slate-600">
          Loading public profile settings...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Public Profile Link
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a unique link for your public candidate
          profile.
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
        className="mt-7"
      >
        <label className="block text-sm font-semibold text-slate-700">
          Profile Slug

          <input
            required
            type="text"
            value={slug}
            onChange={handleSlugChange}
            minLength={3}
            maxLength={60}
            placeholder="ejaz-nawaz"
            className={inputClassName}
          />
        </label>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Lowercase letters, numbers, and hyphens are
          allowed.
        </p>

        {slug ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Profile address
            </p>

            <p className="mt-2 break-all text-sm font-medium text-blue-700">
              /candidates/{slug}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saving || slug.length < 3}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Profile Link"}
          </button>

          {publicUrl && isPublic ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Public Profile
            </a>
          ) : null}
        </div>

        {!isPublic ? (
          <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            Your profile is private. Enable the public
            profile option in your main profile settings
            before sharing this link.
          </p>
        ) : null}
      </form>
    </section>
  );
}