import Button from "@/components/common/Button";

export default function JobSearch() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-center text-3xl font-bold">
          Search Jobs
        </h2>

        <div className="grid gap-4 md:grid-cols-4">

          <input
            type="text"
            placeholder="Job title or keyword"
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
          />

          <input
            type="text"
            placeholder="Location"
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
          />

          <select className="rounded-lg border border-gray-300 px-4 py-3">
            <option>Experience</option>
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior Level</option>
          </select>

          <Button text="Search" />

        </div>

      </div>
    </section>
  );
}