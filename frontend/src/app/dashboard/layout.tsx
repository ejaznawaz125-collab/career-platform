import { redirect } from "next/navigation";

import { auth } from "@/auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { getAuthenticatedCandidateOwner } from "@/lib/candidate-server";

export default async function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const owner = await getAuthenticatedCandidateOwner();

  if (!owner) {
    redirect("/employer");
  }

  return (
    <DashboardLayout
      className="candidate-dashboard"
      sidebar={<DashboardSidebar />}
      header={<DashboardHeader name={session.user.name ?? "Candidate"} />}
    >
      {children}
    </DashboardLayout>
  );
}
