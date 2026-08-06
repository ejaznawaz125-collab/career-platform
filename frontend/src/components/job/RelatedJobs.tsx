import JobCard from "@/components/common/JobCard";

export default function RelatedJobs() {
  const jobs = [
    {
      slug: "inventory-controller-global-supply",
      title: "Inventory Controller",
      company: "Global Supply",
      location: "Dubai, UAE",
    },
    {
      slug: "storekeeper-prime-retail",
      title: "Storekeeper",
      company: "Prime Retail",
      location: "Saudi Arabia",
    },
    {
      slug: "warehouse-coordinator-dhl",
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
        {jobs.map((job) => (
          <JobCard
            key={job.slug}
            slug={job.slug}
            title={job.title}
            company={job.company}
            location={job.location}
          />
        ))}
      </div>
    </section>
  );
}