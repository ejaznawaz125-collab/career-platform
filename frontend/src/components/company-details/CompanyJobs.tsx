import JobCard from "@/components/common/JobCard";

export default function CompanyJobs() {
  const jobs = [
    {
      title: "Warehouse Supervisor",
      company: "ABC Logistics",
      location: "Dubai, UAE",
    },
    {
      title: "Inventory Controller",
      company: "ABC Logistics",
      location: "Dubai, UAE",
    },
    {
      title: "Operations Executive",
      company: "ABC Logistics",
      location: "Saudi Arabia",
    },
  ];

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Open Positions
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