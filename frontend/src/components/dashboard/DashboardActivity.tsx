import Card from "@/components/common/Card";

const activities = [
  "Applied for Warehouse Supervisor",
  "Saved Inventory Controller",
  "Updated Resume",
  "Profile viewed by DHL",
];

export default function DashboardActivity() {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Recent Activity
      </h2>

      <ul className="space-y-4">
        {activities.map((activity) => (
          <li
            key={activity}
            className="rounded-xl border border-slate-200 p-4"
          >
            {activity}
          </li>
        ))}
      </ul>
    </Card>
  );
}