import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentApplications from "@/components/dashboard/RecentApplications";
import SavedJobs from "@/components/dashboard/SavedJobs";
import ProfileCompletion from "@/components/dashboard/ProfileCompletion";
import DashboardActivity from "@/components/dashboard/DashboardActivity";

export default function DashboardPage() {
  return (
    <DashboardLayout
      sidebar={<DashboardSidebar />}
      header={<DashboardHeader />}
    >
      <DashboardStats />

      <div className="grid gap-8 xl:grid-cols-2">
        <RecentApplications />
        <SavedJobs />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <ProfileCompletion />
        <DashboardActivity />
      </div>
    </DashboardLayout>
  );
}