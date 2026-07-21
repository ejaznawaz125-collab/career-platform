import JobCard from "@/components/common/JobCard";

export default function JobsGrid() {
  const jobs = [
    {
      title: "Warehouse Supervisor",
      company: "ABC Logistics",
      location: "Dubai, UAE",
    },
    {
      title: "Inventory Controller",
      company: "Global Supply",
      location: "Singapore",
    },
    {
      title: "Storekeeper",
      company: "Prime Retail",
      location: "Saudi Arabia",
    },
    {
      title: "Operations Executive",
      company: "Fast Cargo",
      location: "Malaysia",
    },
    {
      title: "Logistics Coordinator",
      company: "DHL",
      location: "Pakistan",
    },
    {
      title: "Supply Chain Officer",
      company: "Nestlé",
      location: "UAE",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {jobs.map((job, index) => (
        <JobCard
          key={index}
          title={job.title}
          company={job.company}
          location={job.location}
        />
      ))}
    </div>
  );
}