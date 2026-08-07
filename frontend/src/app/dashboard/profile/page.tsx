import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Container from "@/components/common/Container";
import Header from "@/components/layout/Header";
import ProfileWorkspace from "@/components/profile/ProfileWorkspace";

export default async function CandidateProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="py-10">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Candidate Profile
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Manage your personal
                information, professional
                experience, education,
                skills, languages,
                portfolio projects, and
                resumes.
              </p>
            </div>

            <ProfileWorkspace />
          </div>
        </Container>
      </section>
    </main>
  );
}
