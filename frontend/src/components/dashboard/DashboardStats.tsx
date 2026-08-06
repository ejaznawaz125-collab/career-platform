type DashboardStatsProps = {
  appliedJobs: number;
  savedJobs: number;
  profileViews: number;
  messages: number;
};

import Card from "@/components/common/Card";

export default function DashboardStats({
  appliedJobs,
  savedJobs,
  profileViews,
  messages,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Applied Jobs",
      value: appliedJobs,
    },
    {
      title: "Saved Jobs",
      value: savedJobs,
    },
    {
      title: "Profile Views",
      value: profileViews,
    },
    {
      title: "Messages",
      value: messages,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.title}>
          <p className="text-sm text-slate-500">
            {item.title}
          </p>

          <h2 className="mt-4 text-4xl font-bold text-slate-900">
            {item.value}
          </h2>
        </Card>
      ))}
    </div>
  );
}