"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

type ApplyButtonProps = {
  jobId: string;
  initiallyApplied?: boolean;
  eligibleResumes?: Array<{
    id: string;
    title: string;
    originalName: string | null;
    isDefault: boolean;
  }>;
};

export default function ApplyButton({
  jobId,
  initiallyApplied = false,
  eligibleResumes = [],
}: ApplyButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(initiallyApplied);
  const [message, setMessage] = useState(
    initiallyApplied ? "You have already applied for this job." : "",
  );
  const [isError, setIsError] = useState(false);
  const [resumeId, setResumeId] = useState(eligibleResumes[0]?.id ?? "");

  async function applyJob() {
    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      const response = await fetch(
        `/api/jobs/${jobId}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: resumeId || undefined }),
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
      {!applied ? (
        eligibleResumes.length ? (
          <label className="mb-4 block min-w-0">
            <span className="text-sm font-semibold text-slate-700">
              Resume <span className="font-normal text-slate-500">(optional)</span>
            </span>
            <select
              value={resumeId}
              onChange={(event) => setResumeId(event.target.value)}
              disabled={loading}
              className="mt-2 block w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Apply without a resume</option>
              {eligibleResumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title}{resume.isDefault ? " (Default)" : ""}
                  {resume.originalName ? ` — ${resume.originalName}` : ""}
                </option>
              ))}
            </select>
            <span className="mt-1.5 block break-words text-xs text-slate-500">
              The selected managed resume will be retained with this application.
            </span>
          </label>
        ) : (
          <p className="mb-4 text-sm text-slate-600">
            You can apply without a resume. Upload a managed resume from your profile to attach one.
          </p>
        )
      ) : null}
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
