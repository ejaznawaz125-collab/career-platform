"use client";

import { useEffect, useState } from "react";

type CompletionResponse = {
  success: boolean;
  completion: {
    percentage: number;
    completedFields: number;
    totalFields: number;
    isComplete: boolean;
    missingFields: string[];
  };
};

export default function ProfileCompletionCard() {
  const [loading, setLoading] = useState(true);

  const [data, setData] =
    useState<CompletionResponse | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/profile/completion",
          {
            cache: "no-store",
          },
        );

        const json =
          (await response.json()) as CompletionResponse;

        setData(json);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        Loading profile completion...
      </div>
    );
  }

  if (!data?.success) {
    return null;
  }

  const completion = data.completion;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        Profile Completion
      </h2>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${completion.percentage}%`,
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span>
          {completion.completedFields}/
          {completion.totalFields} Completed
        </span>

        <span className="font-bold text-blue-700">
          {completion.percentage}%
        </span>
      </div>

      {!completion.isComplete &&
        completion.missingFields.length >
          0 && (
          <>
            <h3 className="mt-6 font-semibold">
              Missing Fields
            </h3>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {completion.missingFields.map(
                (field) => (
                  <li key={field}>
                    {field}
                  </li>
                ),
              )}
            </ul>
          </>
        )}
    </div>
  );
}