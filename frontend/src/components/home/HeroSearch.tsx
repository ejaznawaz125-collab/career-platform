export default function HeroSearch() {
  return (
    <div className="mt-12 rounded-2xl bg-white p-6 shadow-xl">

      <div className="grid gap-4 md:grid-cols-4">

        <input
          type="text"
          placeholder="Job title or keyword"
          className="rounded-xl border border-gray-300 px-4 py-4 outline-none transition focus:border-blue-600"
        />

        <input
          type="text"
          placeholder="Location"
          className="rounded-xl border border-gray-300 px-4 py-4 outline-none transition focus:border-blue-600"
        />

        <select
          className="rounded-xl border border-gray-300 px-4 py-4 outline-none"
        >
          <option>Experience</option>
          <option>Entry Level</option>
          <option>Mid Level</option>
          <option>Senior Level</option>
        </select>

        <button
          className="rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700"
        >
          Search Jobs
        </button>

      </div>

    </div>
  );
}