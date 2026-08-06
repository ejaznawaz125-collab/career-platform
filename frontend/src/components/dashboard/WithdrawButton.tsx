"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

type WithdrawButtonProps = {
  applicationId: string;
};

export default function WithdrawButton({
  applicationId,
}: WithdrawButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function withdrawApplication() {
    const confirmed = confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/applications/${applicationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();

        alert(data.message ?? "Unable to withdraw application.");

        return;
      }

      alert("Application withdrawn successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      text={loading ? "Withdrawing..." : "Withdraw"}
      variant="danger"
      loading={loading}
      onClick={withdrawApplication}
    />
  );
}