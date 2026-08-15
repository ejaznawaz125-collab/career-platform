"use client";

import { ApplicationStatus } from "@prisma/client";
import { useState } from "react";

const labels: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  REVIEWING: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export default function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function updateStatus(nextStatus: ApplicationStatus) {
    const previousStatus = currentStatus;
    setCurrentStatus(nextStatus);
    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/employer/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to update application status.");
      }

      setMessage("Application status updated.");
    } catch (error) {
      setCurrentStatus(previousStatus);
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Unable to update application status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        Application status
        <select
          value={currentStatus}
          disabled={saving}
          onChange={(event) => void updateStatus(event.target.value as ApplicationStatus)}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
        >
          {Object.values(ApplicationStatus).map((value) => (
            <option key={value} value={value}>{labels[value]}</option>
          ))}
        </select>
      </label>
      {message ? (
        <p role={isError ? "alert" : "status"} className={`mt-2 text-sm font-medium ${isError ? "text-red-700" : "text-green-700"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
