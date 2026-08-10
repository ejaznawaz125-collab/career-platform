import { auth } from "@/auth";
import { redirect } from "next/navigation";

import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentApplications from "@/components/dashboard/RecentApplications";
import SavedJobs from "@/components/dashboard/SavedJobs";
import ProfileCompletion from "@/components/dashboard/ProfileCompletion";
import BecomeEmployerButton from "@/components/employer/BecomeEmployerButton";
import { getSavedJobs } from "@/lib/saved-jobs";

import {
  getDashboardStats,
  getRecentApplications,
} from "@/lib/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const stats = await getDashboardStats(session.user.id);

  const applications = await getRecentApplications(
    session.user.id
  );
  const savedJobs = await getSavedJobs(session.user.id);

  return (
    <>
      <DashboardStats
        appliedJobs={stats.appliedJobs}
        savedJobs={stats.savedJobs}
        profileViews={stats.profileViews}
        messages={stats.messages}
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <RecentApplications
          applications={applications}
        />

        <SavedJobs jobs={savedJobs.slice(0, 5)} />
      </div>

      {session.user.role === "USER" && (
        <div className="mt-8">
          <BecomeEmployerButton />
        </div>
      )}

      <div className="mt-8">
        <ProfileCompletion />
      </div>
    </>
  );
}
