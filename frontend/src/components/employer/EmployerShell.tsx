import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function EmployerShell({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <DashboardLayout
      sidebar={<DashboardSidebar variant="employer" />}
      header={<DashboardHeader name={name} role="Employer" dashboardHref="/employer" />}
    >
      {children}
    </DashboardLayout>
  );
}
