"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteJobButtonProps {
  jobId: string;
}

export default function DeleteJobButton({
  jobId,
}: DeleteJobButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/employer/jobs/${jobId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Delete failed.");
        return;
      }

      router.refresh();

    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
    {error ? <p role="alert" className="mt-2 max-w-40 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
