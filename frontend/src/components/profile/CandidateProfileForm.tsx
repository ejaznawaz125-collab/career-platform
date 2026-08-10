"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  address: string;

  headline: string;
  currentJobTitle: string;
  summary: string;

  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;

  expectedSalary: string;
  currentSalary: string;
  salaryCurrency: string;

  totalExperience: string;
  experienceLevel: string;
  highestEducation: string;

  availableForWork: boolean;
  availableImmediately: boolean;
  openToRemote: boolean;

  preferredCountry: string;
  preferredCity: string;
  preferredJobType: string;
  preferredWorkMode: string;

  isPublic: boolean;
};

type ProfileApiResponse = {
  success: boolean;
  message?: string;

  user?: {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    country?: string | null;
    city?: string | null;
    address?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    portfolioUrl?: string | null;
  };

  profile?: {
    headline?: string | null;
    currentJobTitle?: string | null;
    summary?: string | null;

    expectedSalary?: number | null;
    currentSalary?: number | null;
    salaryCurrency?: string | null;

    totalExperience?: string | number | null;
    experienceLevel?: string | null;
    highestEducation?: string | null;

    availableForWork?: boolean;
    availableImmediately?: boolean;
    openToRemote?: boolean;

    preferredCountry?: string | null;
    preferredCity?: string | null;
    preferredJobType?: string | null;
    preferredWorkMode?: string | null;

    isPublic?: boolean;
  };

  errors?: Record<string, string[] | undefined>;
};

const initialFormData: ProfileFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  country: "",
  city: "",
  address: "",

  headline: "",
  currentJobTitle: "",
  summary: "",

  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",

  expectedSalary: "",
  currentSalary: "",
  salaryCurrency: "USD",

  totalExperience: "",
  experienceLevel: "",
  highestEducation: "",

  availableForWork: true,
  availableImmediately: false,
  openToRemote: true,

  preferredCountry: "",
  preferredCity: "",
  preferredJobType: "",
  preferredWorkMode: "",

  isPublic: true,
};

const experienceLevels = [
  { value: "", label: "Select experience level" },
  { value: "ENTRY", label: "Entry Level" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Mid Level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "MANAGER", label: "Manager" },
  { value: "DIRECTOR", label: "Director" },
  { value: "EXECUTIVE", label: "Executive" },
];

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClassName =
  "block text-sm font-semibold text-slate-700";

function nullableNumber(value: string): number | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}
function optionalValue(value: string): string | undefined {
  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}

export default function CandidateProfileForm() {
  const [formData, setFormData] =
    useState<ProfileFormData>(initialFormData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/profile", {
        method: "GET",
        cache: "no-store",
      });

      const result =
        (await response.json()) as ProfileApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load profile.",
        );
      }

      const user = result.user;
      const profile = result.profile;

      setFormData({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        phone: user?.phone ?? "",
        country: user?.country ?? "",
        city: user?.city ?? "",
        address: user?.address ?? "",

        headline: profile?.headline ?? "",
        currentJobTitle:
          profile?.currentJobTitle ?? "",
        summary: profile?.summary ?? "",

        linkedinUrl: user?.linkedinUrl ?? "",
        githubUrl: user?.githubUrl ?? "",
        portfolioUrl: user?.portfolioUrl ?? "",

        expectedSalary:
          profile?.expectedSalary !== null &&
          profile?.expectedSalary !== undefined
            ? String(profile.expectedSalary)
            : "",

        currentSalary:
          profile?.currentSalary !== null &&
          profile?.currentSalary !== undefined
            ? String(profile.currentSalary)
            : "",

        salaryCurrency:
          profile?.salaryCurrency ?? "USD",

        totalExperience:
          profile?.totalExperience !== null &&
          profile?.totalExperience !== undefined
            ? String(profile.totalExperience)
            : "",

        experienceLevel:
          profile?.experienceLevel ?? "",

        highestEducation:
          profile?.highestEducation ?? "",

        availableForWork:
          profile?.availableForWork ?? true,

        availableImmediately:
          profile?.availableImmediately ?? false,

        openToRemote:
          profile?.openToRemote ?? true,

        preferredCountry:
          profile?.preferredCountry ?? "",

        preferredCity:
          profile?.preferredCity ?? "",

        preferredJobType:
          profile?.preferredJobType ?? "",

        preferredWorkMode:
          profile?.preferredWorkMode ?? "",

        isPublic:
          profile?.isPublic ?? true,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >,
  ) {
    const target = event.target;
    const name = target.name as keyof ProfileFormData;

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,

        phone: optionalValue(formData.phone),
        country: optionalValue(formData.country),
        city: optionalValue(formData.city),
        address: optionalValue(formData.address),

        headline: optionalValue(formData.headline),
        currentJobTitle: optionalValue(
          formData.currentJobTitle,
        ),
        summary: optionalValue(formData.summary),

        linkedinUrl: optionalValue(
          formData.linkedinUrl,
        ),
        githubUrl: optionalValue(formData.githubUrl),
        portfolioUrl: optionalValue(
          formData.portfolioUrl,
        ),

        expectedSalary: nullableNumber(
          formData.expectedSalary,
        ),
        currentSalary: nullableNumber(
          formData.currentSalary,
        ),
        salaryCurrency:
          optionalValue(formData.salaryCurrency) ?? "USD",

        totalExperience: nullableNumber(
          formData.totalExperience,
        ),

        experienceLevel:
          formData.experienceLevel || null,

        highestEducation: optionalValue(
          formData.highestEducation,
        ),

        availableForWork:
          formData.availableForWork,

        availableImmediately:
          formData.availableImmediately,

        openToRemote:
          formData.openToRemote,

        preferredCountry: optionalValue(
          formData.preferredCountry,
        ),

        preferredCity: optionalValue(
          formData.preferredCity,
        ),

        preferredJobType:
          formData.preferredJobType || null,

        preferredWorkMode:
          formData.preferredWorkMode || null,

        isPublic: formData.isPublic,
      };

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result =
        (await response.json()) as ProfileApiResponse;

      if (!response.ok || !result.success) {
        const validationMessages = result.errors
          ? Object.values(result.errors)
              .flatMap((values) => values ?? [])
              .filter(Boolean)
          : [];

        throw new Error(
          validationMessages[0] ||
            result.message ||
            "Profile update failed.",
        );
      }

      setMessage(
        result.message ||
          "Profile updated successfully.",
      );

      await loadProfile();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Profile update failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-600">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {errorMessage ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700"
        >
          {message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-950">
          Personal Information
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            First Name
            <input
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Last Name
            <input
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Phone
            <input
              name="phone"
              value={formData.phone}
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
            City
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Address
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-950">
          Professional Overview
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className={`${labelClassName} sm:col-span-2`}>
            Professional Headline
            <input
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="Warehouse Supervisor | Inventory Specialist"
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Current Job Title
            <input
              name="currentJobTitle"
              value={formData.currentJobTitle}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Experience Level
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className={inputClassName}
            >
              {experienceLevels.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClassName}>
            Total Experience
            <input
              type="number"
              min="0"
              max="99.99"
              step="0.1"
              name="totalExperience"
              value={formData.totalExperience}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Highest Education
            <input
              name="highestEducation"
              value={formData.highestEducation}
              onChange={handleChange}
              placeholder="Bachelor in Computer Science"
              className={inputClassName}
            />
          </label>

          <label className={`${labelClassName} sm:col-span-2`}>
            Professional Summary
            <textarea
              name="summary"
              rows={7}
              value={formData.summary}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-950">
          Professional Links
        </h2>

        <div className="mt-6 grid gap-5">
          <label className={labelClassName}>
            LinkedIn URL
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            GitHub URL
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Portfolio URL
            <input
              type="url"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
