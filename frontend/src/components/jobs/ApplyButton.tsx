"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

type ApplyButtonProps = {
  jobId: string;
  initiallyApplied?: boolean;
};

export default function ApplyButton({
  jobId,
  initiallyApplied = false,
}: ApplyButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(initiallyApplied);
  const [message, setMessage] = useState(
    initiallyApplied ? "You have already applied for this job." : "",
  );
  const [isError, setIsError] = useState(false);

  async function applyJob() {
    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      const response = await fetch(
        `/api/jobs/${jobId}/apply`,
        {
          method: "POST",
        }
      );

      const data = (await response.json()) as { message?: string };

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 409) {
        const alreadyApplied = data.message?.toLowerCase().includes("already");
        setApplied(Boolean(alreadyApplied));
        setMessage(data.message ?? "You have already applied for this job.");
        setIsError(!alreadyApplied);
        return;
      }

      if (!response.ok) {
        setMessage(data.message ?? "Something went wrong.");
        setIsError(true);
        return;
      }

      setApplied(true);
      setMessage("Application submitted successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Unable to apply. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        text={applied ? "Already Applied" : loading ? "Applying..." : "Apply Now"}
        loading={loading}
        disabled={applied}
        onClick={applyJob}
        className="w-full"
      />
      {message ? (
        <p
          role={isError ? "alert" : "status"}
          className={`mt-3 text-sm font-medium ${
            isError ? "text-red-700" : "text-green-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
