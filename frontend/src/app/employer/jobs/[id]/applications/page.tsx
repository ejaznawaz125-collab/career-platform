import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import ApplicationStatusSelect from "@/components/employer/ApplicationStatusSelect";
import EmployerShell from "@/components/employer/EmployerShell";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function EmployerJobApplicationsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "EMPLOYER") redirect("/dashboard");

  const { id } = await params;
  const job = await prisma.job.findFirst({
    where: { id, company: { ownerId: session.user.id } },
    select: {
      id: true,
      title: true,
      applications: {
        orderBy: { appliedAt: "desc" },
        select: {
          id: true,
          resumeId: true,
          coverLetter: true,
          status: true,
          appliedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              city: true,
              country: true,
              candidateProfile: {
                select: {
                  slug: true,
                  isPublic: true,
                  headline: true,
                  currentJobTitle: true,
                  totalExperience: true,
                  highestEducation: true,
                  skills: {
                    orderBy: [{ featured: "desc" }, { name: "asc" }],
                    take: 8,
                    select: { id: true, name: true },
                  },
                  experiences: {
                    orderBy: [{ currentlyWorking: "desc" }, { startDate: "desc" }],
                    take: 2,
                    select: { id: true, position: true, company: true },
                  },
                  languages: {
                    orderBy: [{ isNative: "desc" }, { language: "asc" }],
                    take: 4,
                    select: { id: true, language: true, proficiency: true, isNative: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!job) notFound();

  const referencedResumeIds = job.applications
    .map((application) => application.resumeId)
    .filter((resumeId): resumeId is string => Boolean(resumeId));
  const referencedResumes = referencedResumeIds.length
    ? await prisma.resume.findMany({
        where: {
          id: { in: referencedResumeIds },
          uploadStatus: "READY",
          storagePath: { not: null },
        },
        select: { id: true, profile: { select: { userId: true } } },
      })
    : [];
  const resumeOwners = new Map(
    referencedResumes.map((resume) => [resume.id, resume.profile.userId]),
  );

  return (
    <EmployerShell name={session.user.name ?? "Employer"}>
    <main className="mx-auto max-w-5xl">
      <Link href="/employer/jobs" className="text-sm font-semibold text-blue-700 hover:underline">← Back to My Jobs</Link>
      <h1 className="mt-5 text-3xl font-bold text-slate-950">Applicants for {job.title}</h1>
      <p className="mt-2 text-slate-600">Review candidates and update their persisted application status.</p>

      {job.applications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">No applications received yet.</div>
      ) : (
        <div className="mt-8 space-y-4">
          {job.applications.map((application) => (
            <article key={application.id} className="grid min-w-0 gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_240px] sm:items-start">
              <div className="min-w-0">
                <h2 className="break-words font-bold text-slate-950">{application.user.firstName} {application.user.lastName}</h2>
                <p className="mt-1 text-sm text-slate-500">Applied {application.appliedAt.toLocaleDateString()}</p>
                {application.user.candidateProfile?.headline ? (
                  <p className="mt-3 break-words font-medium text-slate-700">{application.user.candidateProfile.headline}</p>
                ) : application.user.candidateProfile?.currentJobTitle ? (
                  <p className="mt-3 break-words font-medium text-slate-700">{application.user.candidateProfile.currentJobTitle}</p>
                ) : null}
                {[application.user.city, application.user.country].filter(Boolean).length ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {[application.user.city, application.user.country].filter(Boolean).join(", ")}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                  {application.user.candidateProfile?.totalExperience != null ? (
                    <span>{String(application.user.candidateProfile.totalExperience)} years experience</span>
                  ) : null}
                  {application.user.candidateProfile?.highestEducation ? (
                    <span>{application.user.candidateProfile.highestEducation}</span>
                  ) : null}
                </div>
                {application.user.candidateProfile?.skills.length ? (
                  <div className="mt-3 flex flex-wrap gap-2" aria-label="Candidate skills">
                    {application.user.candidateProfile.skills.map((skill) => (
                      <span key={skill.id} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{skill.name}</span>
                    ))}
                  </div>
                ) : null}
                {application.user.candidateProfile?.experiences.length ? (
                  <div className="mt-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-700">Recent experience</p>
                    <ul className="mt-1 space-y-1">
                      {application.user.candidateProfile.experiences.map((experience) => (
                        <li key={experience.id} className="break-words">{experience.position} at {experience.company}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {application.user.candidateProfile?.languages.length ? (
                  <p className="mt-3 break-words text-sm text-slate-600">
                    Languages: {application.user.candidateProfile.languages.map((language) =>
                      `${language.language} (${language.isNative ? "Native" : language.proficiency.toLowerCase().replaceAll("_", " ")})`,
                    ).join(", ")}
                  </p>
                ) : null}
                {application.coverLetter ? (
                  <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    <summary className="cursor-pointer font-semibold">Cover letter</summary>
                    <p className="mt-2 whitespace-pre-wrap break-words">{application.coverLetter}</p>
                  </details>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  {application.user.candidateProfile?.isPublic && application.user.candidateProfile.slug ? (
                    <Link href={`/candidates/${application.user.candidateProfile.slug}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      View public profile
                    </Link>
                  ) : null}
                  {application.resumeId && resumeOwners.get(application.resumeId) === application.user.id ? (
                    <a href={`/api/employer/applications/${application.id}/resume`} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                      Download application resume
                    </a>
                  ) : null}
                </div>
              </div>
              <ApplicationStatusSelect applicationId={application.id} status={application.status} />
            </article>
          ))}
        </div>
      )}
    </main>
    </EmployerShell>
  );
}
