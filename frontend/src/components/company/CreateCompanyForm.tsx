"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

export default function CreateCompanyForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    website: "",
    industry: "",
    country: "",
    city: "",
    description: "",
    companySize: "MICRO",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        "/api/company/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Something went wrong.");
        return;
      }

      alert("Company created successfully.");

      router.push("/employer");
    } catch (error) {
      console.error(error);
      alert("Unable to create company.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">
            Company Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="ABC Technologies"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Website
          </label>

          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="https://company.com"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Industry
          </label>

          <input
            name="industry"
            value={form.industry}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="Information Technology"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Country
          </label>

          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="Pakistan"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            City
          </label>

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="Lahore"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Company Size
          </label>

          <select
            name="companySize"
            value={form.companySize}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="MICRO">
              1 - 10 Employees
            </option>

            <option value="SMALL">
              11 - 50 Employees
            </option>

            <option value="MEDIUM">
              51 - 200 Employees
            </option>

            <option value="LARGE">
              201 - 500 Employees
            </option>

            <option value="ENTERPRISE">
              500+ Employees
            </option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block font-medium">
          Description
        </label>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={6}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Tell candidates about your company..."
        />
      </div>

      <div className="mt-8">
        <Button
          type="submit"
          text="Create Company"
          loading={loading}
        />
      </div>
    </form>
  );
}