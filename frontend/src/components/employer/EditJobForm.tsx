"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/common/Button";

interface Category {
  id: string;
  name: string;
}

interface EditJobFormProps {
  job: {
    id: string;
    title: string;
    categoryId: string;
    country: string;
    city: string;
    jobType: string;
    workMode: string;
    experienceLevel: string;
    salaryMin: number | null;
    salaryMax: number | null;
    vacancies: number;
    description: string;
    requirements: string;
    responsibilities: string;
    benefits: string;
    status: string;
  };

  categories: Category[];
}

export default function EditJobForm({
  job,
  categories,
}: EditJobFormProps) {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: job.title,
    categoryId: job.categoryId,
    country: job.country,
    city: job.city,
    jobType: job.jobType,
    workMode: job.workMode,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin?.toString() || "",
    salaryMax: job.salaryMax?.toString() || "",
    vacancies: job.vacancies.toString(),
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    benefits: job.benefits,
    status: job.status,
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {

      setLoading(true);

      const response = await fetch(
        `/api/employer/jobs/${job.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Job updated successfully.");

      router.push("/employer/jobs");
      router.refresh();

    } catch (error) {

      console.error(error);

      alert("Something went wrong.");

    } finally {

      setLoading(false);

    }
  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Basic Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block font-medium">
              Job Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Category
            </label>

            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            >
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
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
              required
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
              required
            />
          </div>

        </div>

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Job Details
        </h2>

        <div className="grid gap-6 md:grid-cols-3">

          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FREELANCE">Freelance</option>
            <option value="TEMPORARY">Temporary</option>
          </select>

          <select
            name="workMode"
            value={form.workMode}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>

          <select
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="ENTRY">Entry</option>
            <option value="JUNIOR">Junior</option>
            <option value="MID">Mid</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="MANAGER">Manager</option>
            <option value="DIRECTOR">Director</option>
            <option value="EXECUTIVE">Executive</option>
          </select>

        </div>

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Salary
        </h2>

        <div className="grid gap-6 md:grid-cols-3">

          <input
            name="salaryMin"
            value={form.salaryMin}
            onChange={handleChange}
            placeholder="Minimum Salary"
            className="rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            name="salaryMax"
            value={form.salaryMax}
            onChange={handleChange}
            placeholder="Maximum Salary"
            className="rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            name="vacancies"
            value={form.vacancies}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-4 py-3"
          />

        </div>

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Description
        </h2>

        <textarea
          rows={8}
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Requirements
        </h2>

        <textarea
          rows={6}
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Responsibilities
        </h2>

        <textarea
          rows={6}
          name="responsibilities"
          value={form.responsibilities}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Benefits
        </h2>

        <textarea
          rows={6}
          name="benefits"
          value={form.benefits}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-bold">
          Status
        </h2>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
        </select>

      </div>

      <Button
        type="submit"
        text="Update Job"
        loading={loading}
      />

    </form>
  );
}