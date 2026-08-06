"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type PhotoApiResponse = {
  success: boolean;
  message?: string;
  image?: string | null;
  errors?: Record<string, string[] | undefined>;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function getErrorMessage(
  result: PhotoApiResponse,
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

export default function ProfilePhotoManager() {
  const [image, setImage] = useState("");
  const [savedImage, setSavedImage] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadPhoto = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/photo",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result =
        (await response.json()) as PhotoApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load profile photo.",
        );
      }

      setSavedImage(result.image ?? null);
      setImage(result.image ?? "");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load profile photo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPhoto();
  }, [loadPhoto]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setImage(event.target.value);
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

      const response = await fetch(
        "/api/profile/photo",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
          }),
        },
      );

      const result =
        (await response.json()) as PhotoApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(
            result,
            "Failed to update profile photo.",
          ),
        );
      }

      setSavedImage(result.image ?? null);

      setMessage(
        result.message ||
          "Profile photo updated successfully.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update profile photo.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    const confirmed = window.confirm(
      "Are you sure you want to remove your profile photo?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemoving(true);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        "/api/profile/photo",
        {
          method: "DELETE",
        },
      );

      const result =
        (await response.json()) as PhotoApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to remove profile photo.",
        );
      }

      setImage("");
      setSavedImage(null);

      setMessage(
        result.message ||
          "Profile photo removed successfully.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to remove profile photo.",
      );
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm text-slate-600">
          Loading profile photo...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Profile Photo
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add a professional photograph to your candidate
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

      <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
          {savedImage ? (
            <img
              src={savedImage}
              alt="Candidate profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-500">
              No Photo
            </span>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-w-0 flex-1"
        >
          <label className="block text-sm font-semibold text-slate-700">
            Image URL

            <input
              required
              type="url"
              value={image}
              onChange={handleChange}
              placeholder="https://example.com/profile-photo.jpg"
              className={inputClassName}
            />
          </label>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use a direct link to a JPG, PNG, WEBP, or another
            publicly available image.
          </p>

          {image && image !== savedImage ? (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preview
              </p>

              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={image}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || !image.trim()}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Profile Photo"}
            </button>

            {savedImage ? (
              <button
                type="button"
                onClick={() => void handleRemove()}
                disabled={removing}
                className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removing
                  ? "Removing..."
                  : "Remove Photo"}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}