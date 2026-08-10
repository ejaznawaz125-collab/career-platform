import Card from "@/components/common/Card";
import Link from "next/link";

export default function ProfileCompletion() {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Profile Completion
      </h2>

      <p className="text-slate-600">
        Add information at your own pace. Profile completion never blocks job browsing or applications.
      </p>
      <Link href="/dashboard/profile" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
        Continue profile
      </Link>
    </Card>
  );
}
