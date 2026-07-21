import Card from "@/components/common/Card";

const stats = [
  {
    title: "Applied Jobs",
    value: "18",
  },
  {
    title: "Saved Jobs",
    value: "42",
  },
  {
    title: "Profile Views",
    value: "126",
  },
  {
    title: "Messages",
    value: "9",
  },
];

export default function DashboardStats() {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.title}>
          <p className="text-slate-500">
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