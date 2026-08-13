"use client";

import type { CompanyProfileInput } from "@/lib/company-profile";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditCompanyForm({ initial }: { initial: CompanyProfileInput }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function change(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/company/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) { setError(data.message ?? "Unable to update company."); return; }
      setMessage("Company profile updated.");
      router.refresh();
    } catch { setError("Unable to update company."); }
    finally { setLoading(false); }
  }

  const fields: Array<[keyof CompanyProfileInput, string, string]> = [
    ["name", "Company Name", "text"], ["tagline", "Tagline", "text"], ["website", "Website", "url"],
    ["email", "Company Email", "email"], ["phone", "Phone", "tel"], ["industry", "Industry", "text"],
    ["country", "Country", "text"], ["city", "City", "text"], ["address", "Address", "text"],
  ];

  return <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="grid gap-5 md:grid-cols-2">{fields.map(([name, label, type]) => <label key={name} className="space-y-2 font-medium">{label}<input name={name} type={type} value={String(form[name] ?? "")} onChange={change} required={name === "name"} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100" /></label>)}</div>
    <label className="block space-y-2 font-medium">Company Size<select name="companySize" value={form.companySize} onChange={change} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal">{["MICRO","SMALL","MEDIUM","LARGE","ENTERPRISE"].map((size)=><option key={size} value={size}>{size}</option>)}</select></label>
    <label className="block space-y-2 font-medium">Description<textarea name="description" rows={6} value={form.description ?? ""} onChange={change} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100" /></label>
    {message ? <p role="status" className="text-sm text-green-700">{message}</p> : null}{error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    <button disabled={loading} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Saving…" : "Save Company Profile"}</button>
  </form>;
}
