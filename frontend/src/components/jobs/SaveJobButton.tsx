"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

type SaveJobButtonProps = {
  jobId: string;
};

export default function SaveJobButton({
  jobId,
}: SaveJobButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function toggleSave() {
    try {
      setLoading(true);

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
        const data = await response.json();
        alert(data.message ?? "Something went wrong.");
        return;
      }

      if (response.status === 409) {
        alert("Job is already saved.");
        setSaved(true);
        return;
      }

      setSaved(!saved);

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Unable to save job.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      text={
        loading
          ? "Please wait..."
          : saved
          ? "Saved"
          : "Save Job"
      }
      variant={saved ? "secondary" : "outline"}
      loading={loading}
      onClick={toggleSave}
      className="w-full"
    />
  );
}