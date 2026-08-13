"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@/components/common/Button";

export default function BecomeEmployerButton() {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function becomeEmployer() {
    try {
      setLoading(true);
      setMessage("");
      setError("");
      const response = await fetch("/api/employer/become", { method: "POST" });
      const data = await response.json();
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) {
        setError(data.message ?? "Something went wrong.");
        return;
      }
      await update({ role: data.role });
      setMessage("Employer access enabled. Redirecting to company setup…");
      router.push("/company/create");
      router.refresh();
    } catch {
      setError("Unable to become employer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button text={loading ? "Please wait..." : "Become an Employer"} loading={loading} onClick={becomeEmployer} />
      {message ? <p role="status" className="text-sm text-green-700">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
