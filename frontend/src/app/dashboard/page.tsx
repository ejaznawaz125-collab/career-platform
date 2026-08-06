import { auth } from "@/auth";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentApplications from "@/components/dashboard/RecentApplications";
import SavedJobs from "@/components/dashboard/SavedJobs";
import ProfileCompletion from "@/components/dashboard/ProfileCompletion";
import DashboardActivity from "@/components/dashboard/DashboardActivity";
import BecomeEmployerButton from "@/components/employer/BecomeEmployerButton";

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

  return (
    <DashboardLayout
      sidebar={<DashboardSidebar />}
      header={<DashboardHeader />}
    >
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

        <SavedJobs />
      </div>

      {session.user.role === "USER" && (
        <div className="mt-8">
          <BecomeEmployerButton />
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <ProfileCompletion />

        <DashboardActivity />
      </div>
    </DashboardLayout>
  );
}