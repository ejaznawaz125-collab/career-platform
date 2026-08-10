"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

export default function BecomeEmployerButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function becomeEmployer() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/employer/become",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        alert(data.message ?? "Something went wrong.");
        return;
      }

      alert("Welcome! You are now an Employer.");

      /*
       * JWT session میں role فوری update نہیں ہوگی۔
       * اس لیے دوبارہ login کروا رہے ہیں۔
       * اگلے مرحلے میں ہم session refresh کریں گے
       * تاکہ دوبارہ login کی ضرورت نہ رہے۔
       */

      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Unable to become employer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      text={
        loading
          ? "Please wait..."
          : "Become an Employer"
      }
      loading={loading}
      onClick={becomeEmployer}
    />
  );
}
