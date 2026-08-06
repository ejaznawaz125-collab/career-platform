"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ExperienceLevel,
  JobType,
  WorkMode,
} from "@prisma/client";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

const FILTER_PARAM_KEYS = {
  category: "category",
  jobType: "jobType",
  workMode: "workMode",
  experienceLevel: "experienceLevel",
  featured: "featured",
  urgent: "urgent",
  salaryMin: "salaryMin",
  salaryMax: "salaryMax",
} as const;

type FilterField = keyof typeof FILTER_PARAM_KEYS;

type FilterValues = {
  category: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  featured: boolean;
  urgent: boolean;
  salaryMin: string;
  salaryMax: string;
};

const JOB_TYPE_OPTIONS: ReadonlyArray<{
  value: JobType;
  label: string;
}> = [
  { value: JobType.FULL_TIME, label: "Full Time" },
  { value: JobType.PART_TIME, label: "Part Time" },
  { value: JobType.CONTRACT, label: "Contract" },
  { value: JobType.INTERNSHIP, label: "Internship" },
  { value: JobType.FREELANCE, label: "Freelance" },
  { value: JobType.TEMPORARY, label: "Temporary" },
];

const WORK_MODE_OPTIONS: ReadonlyArray<{
  value: WorkMode;
  label: string;
}> = [
  { value: WorkMode.ONSITE, label: "Onsite" },
  { value: WorkMode.REMOTE, label: "Remote" },
  { value: WorkMode.HYBRID, label: "Hybrid" },
];

const EXPERIENCE_LEVEL_OPTIONS: ReadonlyArray<{
  value: ExperienceLevel;
  label: string;
}> = [
  { value: ExperienceLevel.ENTRY, label: "Entry" },
  { value: ExperienceLevel.JUNIOR, label: "Junior" },
  { value: ExperienceLevel.MID, label: "Mid Level" },
  { value: ExperienceLevel.SENIOR, label: "Senior" },
  { value: ExperienceLevel.LEAD, label: "Lead" },
  { value: ExperienceLevel.MANAGER, label: "Manager" },
  { value: ExperienceLevel.DIRECTOR, label: "Director" },
  { value: ExperienceLevel.EXECUTIVE, label: "Executive" },
];

function getBooleanParam(value: string | null): boolean {
  return value === "true";
}

function getFilterValues(
  searchParams: URLSearchParams,
): FilterValues {
  return {
    category:
      searchParams.get(FILTER_PARAM_KEYS.category) ?? "",
    jobType:
      searchParams.get(FILTER_PARAM_KEYS.jobType) ?? "",
    workMode:
      searchParams.get(FILTER_PARAM_KEYS.workMode) ?? "",
    experienceLevel:
      searchParams.get(
        FILTER_PARAM_KEYS.experienceLevel,
      ) ?? "",
    featured: getBooleanParam(
      searchParams.get(FILTER_PARAM_KEYS.featured),
    ),
    urgent: getBooleanParam(
      searchParams.get(FILTER_PARAM_KEYS.urgent),
    ),
    salaryMin:
      searchParams.get(FILTER_PARAM_KEYS.salaryMin) ?? "",
    salaryMax:
      searchParams.get(FILTER_PARAM_KEYS.salaryMax) ?? "",
  };
}

function areFilterValuesEqual(
  currentValues: FilterValues,
  nextValues: FilterValues,
): boolean {
  return (
    currentValues.category === nextValues.category &&
    currentValues.jobType === nextValues.jobType &&
    currentValues.workMode === nextValues.workMode &&
    currentValues.experienceLevel ===
      nextValues.experienceLevel &&
    currentValues.featured === nextValues.featured &&
    currentValues.urgent === nextValues.urgent &&
    currentValues.salaryMin === nextValues.salaryMin &&
    currentValues.salaryMax === nextValues.salaryMax
  );
}

function normalizeSalaryValue(value: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const numericValue = Number(trimmedValue);

  if (
    !Number.isSafeInteger(numericValue) ||
    numericValue < 0
  ) {
    return "";
  }

  return String(numericValue);
}

export default function JobsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [values, setValues] = useState<FilterValues>(() =>
    getFilterValues(searchParams),
  );

  useEffect(() => {
    const nextValues = getFilterValues(searchParams);

    setValues((currentValues) =>
      areFilterValuesEqual(currentValues, nextValues)
        ? currentValues
        : nextValues,
    );
  }, [searchParams]);

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const field = event.target.name as Extract<
        FilterField,
        "category" | "salaryMin" | "salaryMax"
      >;
      const value = event.target.value;

      setValues((currentValues) => {
        if (currentValues[field] === value) {
          return currentValues;
        }

        return {
          ...currentValues,
          [field]: value,
        };
      });
    },
    [],
  );

  const handleSelectChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const field = event.target.name as Extract<
        FilterField,
        "jobType" | "workMode" | "experienceLevel"
      >;
      const value = event.target.value;

      setValues((currentValues) => {
        if (currentValues[field] === value) {
          return currentValues;
        }

        return {
          ...currentValues,
          [field]: value,
        };
      });
    },
    [],
  );

  const handleCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const field = event.target.name as Extract<
        FilterField,
        "featured" | "urgent"
      >;
      const checked = event.target.checked;

      setValues((currentValues) => {
        if (currentValues[field] === checked) {
          return currentValues;
        }

        return {
          ...currentValues,
          [field]: checked,
        };
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextSearchParams = new URLSearchParams(
        searchParams.toString(),
      );

      const category = values.category.trim();
      const salaryMin = normalizeSalaryValue(
        values.salaryMin,
      );
      const salaryMax = normalizeSalaryValue(
        values.salaryMax,
      );

      if (category) {
  nextSearchParams.set("search", category);
} else {
  nextSearchParams.delete("search");
}

      if (values.jobType) {
        nextSearchParams.set(
          FILTER_PARAM_KEYS.jobType,
          values.jobType,
        );
      } else {
        nextSearchParams.delete(
          FILTER_PARAM_KEYS.jobType,
        );
      }

      if (values.workMode) {
        nextSearchParams.set(
          FILTER_PARAM_KEYS.workMode,
          values.workMode,
        );
      } else {
        nextSearchParams.delete(
          FILTER_PARAM_KEYS.workMode,
        );
      }

      if (values.experienceLevel) {
        nextSearchParams.set(
          FILTER_PARAM_KEYS.experienceLevel,
          values.experienceLevel,
        );
      } else {
        nextSearchParams.delete(
          FILTER_PARAM_KEYS.experienceLevel,
        );
      }

      if (values.featured) {
        nextSearchParams.set(
          FILTER_PARAM_KEYS.featured,
          "true",
        );
      } else {
        nextSearchParams.delete(
          FILTER_PARAM_KEYS.featured,
        );
      }

      if (values.urgent) {
        nextSearchParams.set(
          FILTER_PARAM_KEYS.urgent,
          "true",
        );
      } else {
        nextSearchParams.delete(
          FILTER_PARAM_KEYS.urgent,
        );
      }

      if (salaryMin) {
        nextSearchParams.set(
          FILTER_PARAM_KEYS.salaryMin,
          salaryMin,
        );
      } else {
        nextSearchParams.delete(
          FILTER_PARAM_KEYS.salaryMin,
        );
      }

      if (salaryMax) {
        nextSearchParams.set(
          FILTER_PARAM_KEYS.salaryMax,
          salaryMax,
        );
      } else {
        nextSearchParams.delete(
          FILTER_PARAM_KEYS.salaryMax,
        );
      }

      nextSearchParams.delete("page");

      const queryString = nextSearchParams.toString();

      router.push(
        queryString
          ? `${pathname}?${queryString}`
          : pathname,
      );
    },
    [
      pathname,
      router,
      searchParams,
      values,
    ],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      <h3 className="mb-6 text-xl font-semibold text-slate-900">
        Filters
      </h3>

      <div className="space-y-5">
        <Input
          name="category"
          type="text"
          value={values.category}
          onChange={handleTextChange}
          placeholder="Job title, keyword..."
        />

        <select
          name="jobType"
          value={values.jobType}
          onChange={handleSelectChange}
          aria-label="Job Type"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Job Type</option>

          {JOB_TYPE_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <select
          name="workMode"
          value={values.workMode}
          onChange={handleSelectChange}
          aria-label="Work Mode"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Work Mode</option>

          {WORK_MODE_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <select
          name="experienceLevel"
          value={values.experienceLevel}
          onChange={handleSelectChange}
          aria-label="Experience Level"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Experience Level</option>

          {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Input
            name="salaryMin"
            type="number"
            min="0"
            inputMode="numeric"
            value={values.salaryMin}
            onChange={handleTextChange}
            placeholder="Minimum Salary"
          />

          <Input
            name="salaryMax"
            type="number"
            min="0"
            inputMode="numeric"
            value={values.salaryMax}
            onChange={handleTextChange}
            placeholder="Maximum Salary"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
          <input
            name="featured"
            type="checkbox"
            checked={values.featured}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />

          Featured Jobs
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
          <input
            name="urgent"
            type="checkbox"
            checked={values.urgent}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />

          Urgent Jobs
        </label>

        <Button
          type="submit"
          text="Apply Filters"
          className="w-full"
        />
      </div>
    </form>
  );
}