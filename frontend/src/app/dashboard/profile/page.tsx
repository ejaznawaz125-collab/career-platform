import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Container from "@/components/common/Container";
import Header from "@/components/layout/Header";
import CandidateProfileForm from "@/components/profile/CandidateProfileForm";
import EducationManager from "@/components/profile/EducationManager";
import ExperienceManager from "@/components/profile/ExperienceManager";
import LanguagesManager from "@/components/profile/LanguagesManager";
import PortfolioManager from "@/components/profile/PortfolioManager";
import ProfilePhotoManager from "@/components/profile/ProfilePhotoManager";
import ProfileCompletionCard from "@/components/profile/ProfileCompletionCard";
import ResumeManager from "@/components/profile/ResumeManager";
import SkillsManager from "@/components/profile/SkillsManager";
import PublicProfileSettings from "@/components/profile/PublicProfileSettings";
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

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <div className="min-w-0 space-y-8">
                <ProfilePhotoManager />

                <CandidateProfileForm />

                <SkillsManager />

                <EducationManager />

                <ExperienceManager />

                <LanguagesManager />

                <PortfolioManager />

                <ResumeManager />
                <PublicProfileSettings />
              </div>

              <aside className="lg:sticky lg:top-6">
                <ProfileCompletionCard />
              </aside>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
