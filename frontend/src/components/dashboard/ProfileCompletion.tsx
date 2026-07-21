import Card from "@/components/common/Card";

export default function ProfileCompletion() {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Profile Completion
      </h2>

      <div className="h-4 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-3/4 rounded-full bg-blue-600" />
      </div>

      <p className="mt-4 text-slate-600">
        Your profile is 75% complete.
      </p>
    </Card>
  );
}