import JobCard from "@/components/common/JobCard";

export default function RelatedJobs() {
  const jobs = [
    {
      title: "Inventory Controller",
      company: "Global Supply",
      location: "Dubai, UAE",
    },
    {
      title: "Storekeeper",
      company: "Prime Retail",
      location: "Saudi Arabia",
    },
    {
      title: "Warehouse Coordinator",
      company: "DHL",
      location: "Singapore",
    },
  ];

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Related Jobs
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {jobs.map((job, index) => (
          <JobCard
            key={index}
            title={job.title}
            company={job.company}
            location={job.location}
          />
        ))}
      </div>
    </section>
  );
}