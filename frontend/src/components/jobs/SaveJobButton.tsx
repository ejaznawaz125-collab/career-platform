"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

type SaveJobButtonProps = {
  jobId: string;
  initiallySaved?: boolean;
  onUnsaved?: () => void;
};

export default function SaveJobButton({
  jobId,
  initiallySaved = false,
  onUnsaved,
}: SaveJobButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(initiallySaved);
  const [message, setMessage] = useState(
    initiallySaved ? "This job is saved." : "",
  );
  const [isError, setIsError] = useState(false);

  async function toggleSave() {
    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      const response = await fetch(
        `/api/jobs/${jobId}/save`,
        {
          method: saved ? "DELETE" : "POST",
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok && response.status !== 409) {
        const data = (await response.json()) as { message?: string };
        setMessage(data.message ?? "Something went wrong.");
        setIsError(true);
        return;
      }

      if (response.status === 409) {
        setSaved(true);
        setMessage("Job is already saved.");
        return;
      }

      const nextSaved = !saved;
      setSaved(nextSaved);
      setMessage(nextSaved ? "Job saved successfully." : "Job removed from saved jobs.");

      if (!nextSaved) {
        onUnsaved?.();
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Unable to update saved job. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        text={loading ? "Please wait..." : saved ? "Unsave Job" : "Save Job"}
        variant={saved ? "secondary" : "outline"}
        loading={loading}
        onClick={toggleSave}
        className="w-full"
      />
      {message ? (
        <p
          role={isError ? "alert" : "status"}
          className={`mt-3 text-sm font-medium ${isError ? "text-red-700" : "text-green-700"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
