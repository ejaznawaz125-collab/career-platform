"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function JobsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [location, setLocation] = useState(searchParams.get("country") ?? "");
  const [company, setCompany] = useState(searchParams.get("company") ?? "");

  function handleSearch() {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (location.trim()) {
      params.set("country", location.trim());
    }

    if (company.trim()) {
      params.set("company", company.trim());
    }

    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">
        <Input
          type="text"
          placeholder="Job Title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <Button
          text="Search Jobs"
          className="w-full"
          onClick={handleSearch}
        />
      </div>
    </div>
  );
}