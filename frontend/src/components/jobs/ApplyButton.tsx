"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

type ApplyButtonProps = {
  jobId: string;
};

export default function ApplyButton({
  jobId,
}: ApplyButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function applyJob() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/jobs/${jobId}/apply`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 409) {
        alert("You have already applied for this job.");
        return;
      }

      if (!response.ok) {
        alert(data.message ?? "Something went wrong.");
        return;
      }

      alert("Application submitted successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Unable to apply.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      text={loading ? "Applying..." : "Apply Now"}
      loading={loading}
      onClick={applyJob}
      className="w-full"
    />
  );
}