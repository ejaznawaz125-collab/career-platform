import type { Metadata } from "next";
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe2,
  GraduationCap,
  Languages,
  Linkedin,
  MapPin,
} from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import Container from "@/components/common/Container";
import Header from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";

type CandidatePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPublicCandidate(
  slug: string,
) {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  return prisma.candidateProfile.findFirst({
    where: {
      slug: {
        equals: normalizedSlug,
        mode: "insensitive",
      },
      isPublic: true,
      user: {
        is: {
          status: "ACTIVE",
        },
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
          image: true,
          country: true,
          city: true,
          linkedinUrl: true,
          githubUrl: true,
          portfolioUrl: true,
        },
      },

      skills: {
        orderBy: [
          {
            featured: "desc",
          },
          {
            name: "asc",
          },
        ],
      },

      educations: {
        orderBy: [
          {
            currentlyStudying: "desc",
          },
          {
            endYear: "desc",
          },
        ],
      },

      experiences: {
        orderBy: [
          {
            currentlyWorking: "desc",
          },
          {
            startDate: "desc",
          },
        ],
      },

      languages: {
        orderBy: [
          {
            isNative: "desc",
          },
          {
            language: "asc",
          },
        ],
      },

      portfolioProjects: {
        orderBy: [
          {
            featured: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      },

      resumes: {
        where: {
          isPublic: true,
        },
        orderBy: [
          {
            isDefault: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      },
    },
  });
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatEmploymentType(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export async function generateMetadata({
  params,
}: CandidatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await getPublicCandidate(slug);

  if (!candidate) {
    return {
      title: "Candidate not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const fullName =
    `${candidate.user.firstName} ${candidate.user.lastName}`.trim();

  const description =
    candidate.headline ||
    candidate.summary?.slice(0, 160) ||
    `View ${fullName}'s professional profile, experience, education, skills and portfolio.`;

  return {
    title: `${fullName} — Professional Profile`,
    description,
    alternates: {
      canonical: `/candidates/${candidate.slug}`,
    },
    openGraph: {
      type: "profile",
      title: `${fullName} — Professional Profile`,
      description,
      url: `/candidates/${candidate.slug}`,
      images: candidate.user.image
        ? [
            {
              url: candidate.user.image,
              alt: fullName,
            },
          ]
        : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CandidatePage({
  params,
}: CandidatePageProps) {
  const { slug } = await params;
  const candidate = await getPublicCandidate(slug);

  if (!candidate) {
    notFound();
  }

  await prisma.candidateProfile.update({
    where: {
      id: candidate.id,
    },
    data: {
      profileViews: {
        increment: 1,
      },
    },
  });

  const fullName =
    `${candidate.user.firstName} ${candidate.user.lastName}`.trim();

  const location = [
    candidate.user.city,
    candidate.user.country,
  ]
    .filter(
      (value): value is string =>
        Boolean(value),
    )
    .join(", ");

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="py-10">
  <Container>
        <Link href="/" className="mb-6 inline-flex text-sm font-semibold text-blue-700 hover:underline">â† Back to Home</Link>
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-40 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-700" />

          <div className="px-6 pb-8 sm:px-8">
            <div className="-mt-16 flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-slate-100 shadow-lg">
                {candidate.user.image ? (
                  <img
                    src={candidate.user.image}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-slate-500">
                    {candidate.user.firstName
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 sm:pb-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {fullName}
                  </h1>

                  {candidate.availableForWork ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={14} />
                      Open to Work
                    </span>
                  ) : null}
                </div>

                {candidate.headline ? (
                  <p className="mt-2 text-lg text-slate-600">
                    {candidate.headline}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                  {location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={16} />
                      {location}
                    </span>
                  ) : null}

                  {candidate.currentJobTitle ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase size={16} />
                      {candidate.currentJobTitle}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {candidate.summary ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-950">
                  About
                </h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                  {candidate.summary}
                </p>
              </section>
            ) : null}

            {candidate.experiences.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                  <Briefcase size={22} />
                  Experience
                </h2>

                <div className="mt-6 divide-y divide-slate-200">
                  {candidate.experiences.map(
                    (experience) => (
                      <article
                        key={experience.id}
                        className="py-6 first:pt-0 last:pb-0"
                      >
                        <h3 className="text-lg font-bold text-slate-900">
                          {experience.position}
                        </h3>

                        <p className="mt-1 font-medium text-blue-700">
                          {experience.company}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          {formatDate(
                            experience.startDate,
                          )}{" "}
                          —{" "}
                          {experience.currentlyWorking
                            ? "Present"
                            : experience.endDate
                              ? formatDate(
                                  experience.endDate,
                                )
                              : "Not specified"}
                          {formatEmploymentType(
                            experience.employmentType,
                          )
                            ? ` · ${formatEmploymentType(
                                experience.employmentType,
                              )}`
                            : ""}
                        </p>

                        {experience.description ? (
                          <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                            {experience.description}
                          </p>
                        ) : null}

                        {experience.achievements ? (
                          <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                            {experience.achievements}
                          </p>
                        ) : null}
                      </article>
                    ),
                  )}
                </div>
              </section>
            ) : null}

            {candidate.educations.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                  <GraduationCap size={22} />
                  Education
                </h2>

                <div className="mt-6 divide-y divide-slate-200">
                  {candidate.educations.map(
                    (education) => (
                      <article
                        key={education.id}
                        className="py-6 first:pt-0 last:pb-0"
                      >
                        <h3 className="text-lg font-bold text-slate-900">
                          {education.degree}
                        </h3>

                        <p className="mt-1 font-medium text-blue-700">
                          {education.institute}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          {education.startYear ??
                            "Not specified"}{" "}
                          —{" "}
                          {education.currentlyStudying
                            ? "Present"
                            : education.endYear ??
                              "Not specified"}
                        </p>

                        {education.fieldOfStudy ? (
                          <p className="mt-2 text-slate-600">
                            {education.fieldOfStudy}
                          </p>
                        ) : null}
                      </article>
                    ),
                  )}
                </div>
              </section>
            ) : null}

            {candidate.portfolioProjects.length >
            0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-950">
                  Portfolio Projects
                </h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {candidate.portfolioProjects.map(
                    (project) => (
                      <article
                        key={project.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <h3 className="text-lg font-bold text-slate-900">
                          {project.title}
                        </h3>

                        {project.description ? (
                          <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                            {project.description}
                          </p>
                        ) : null}

                        {project.technologies.length >
                        0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.technologies.map(
                              (technology) => (
                                <span
                                  key={technology}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  {technology}
                                </span>
                              ),
                            )}
                          </div>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-3">
                          {project.projectUrl ? (
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700"
                            >
                              <ExternalLink size={15} />
                              Live Project
                            </a>
                          ) : null}

                          {project.githubUrl ? (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700"
                            >
                              <Github size={15} />
                              GitHub
                            </a>
                          ) : null}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            {candidate.skills.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">
                  Skills
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {candidate.languages.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                  <Languages size={20} />
                  Languages
                </h2>

                <div className="mt-4 space-y-3">
                  {candidate.languages.map(
                    (language) => (
                      <div
                        key={language.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="font-medium text-slate-800">
                          {language.language}
                        </span>

                        <span className="text-sm text-slate-500">
                          {language.isNative
                            ? "Native"
                            : language.proficiency
                                .toLowerCase()
                                .replace("_", " ")}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                Professional Links
              </h2>

              <div className="mt-4 space-y-3">
                {candidate.user.linkedinUrl ? (
                  <a
                    href={
                      candidate.user.linkedinUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-blue-700"
                  >
                    <Linkedin size={17} />
                    LinkedIn
                  </a>
                ) : null}

                {candidate.user.githubUrl ? (
                  <a
                    href={candidate.user.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-slate-700"
                  >
                    <Github size={17} />
                    GitHub
                  </a>
                ) : null}

                {candidate.user.portfolioUrl ? (
                  <a
                    href={
                      candidate.user.portfolioUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-blue-700"
                  >
                    <Globe2 size={17} />
                    Portfolio
                  </a>
                ) : null}
              </div>
            </section>

            {candidate.resumes.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">
                  Public Resume
                </h2>

                <a
                  href={candidate.resumes[0].fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <ExternalLink size={16} />
                  View Resume
                </a>
              </section>
            ) : null}
          </aside>
        </div>
        </Container>
</section>
    </main>
  );
}
