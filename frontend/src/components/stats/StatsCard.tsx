type StatsCardProps = {
  number: string;
  label: string;
};

export default function StatsCard({
  number,
  label,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <h3 className="text-4xl font-bold text-blue-600">
        {number}
      </h3>

      <p className="mt-3 text-gray-600">
        {label}
      </p>

    </div>
  );
}