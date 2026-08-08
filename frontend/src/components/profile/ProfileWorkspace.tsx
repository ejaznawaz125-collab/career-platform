"use client";

import {
  BriefcaseBusiness,
  Camera,
  FileText,
  FolderKanban,
  GraduationCap,
  Languages,
  Link2,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { KeyboardEvent, useRef, useState } from "react";

import CandidateProfileForm from "./CandidateProfileForm";
import EducationManager from "./EducationManager";
import ExperienceManager from "./ExperienceManager";
import LanguagesManager from "./LanguagesManager";
import PortfolioManager from "./PortfolioManager";
import ProfileCompletionCard from "./ProfileCompletionCard";
import ProfilePhotoManager from "./ProfilePhotoManager";
import PublicProfileSettings from "./PublicProfileSettings";
import ResumeManager from "./ResumeManager";
import SkillsManager from "./SkillsManager";

const sections = [
  {
    id: "basic",
    label: "Basic Information",
    description: "Personal details, career preferences, and professional links.",
    icon: UserRound,
    component: CandidateProfileForm,
  },
  {
    id: "photo",
    label: "Profile Photo",
    description: "Upload and manage your professional profile picture.",
    icon: Camera,
    component: ProfilePhotoManager,
  },
  {
    id: "skills",
    label: "Skills",
    description: "Showcase your professional and technical strengths.",
    icon: Sparkles,
    component: SkillsManager,
  },
  {
    id: "education",
    label: "Education",
    description: "Add qualifications, institutions, and fields of study.",
    icon: GraduationCap,
    component: EducationManager,
  },
  {
    id: "experience",
    label: "Experience",
    description: "Document your employment history and achievements.",
    icon: BriefcaseBusiness,
    component: ExperienceManager,
  },
  {
    id: "languages",
    label: "Languages",
    description: "List the languages you speak and your proficiency.",
    icon: Languages,
    component: LanguagesManager,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Present projects that demonstrate your capabilities.",
    icon: FolderKanban,
    component: PortfolioManager,
  },
  {
    id: "resumes",
    label: "Resumes",
    description: "Manage your resume records and default resume.",
    icon: FileText,
    component: ResumeManager,
  },
  {
    id: "public-profile",
    label: "Public Profile",
    description: "Control profile visibility and your public profile address.",
    icon: Link2,
    component: PublicProfileSettings,
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  component: React.ComponentType;
}>;

type SectionId = (typeof sections)[number]["id"];

function ProfileNavigation({
  activeSection,
  onSelect,
  buttonRefs,
  idPrefix,
  className,
}: {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
  buttonRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>;
  idPrefix: "desktop" | "mobile";
  className: string;
}) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % sections.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + sections.length) % sections.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = sections.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextSection = sections[nextIndex];
    onSelect(nextSection.id);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Candidate profile sections"
      className={className}
    >
      {sections.map((section, index) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            id={`${idPrefix}-profile-tab-${section.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`profile-panel-${section.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(section.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100 lg:w-full ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="whitespace-nowrap">{section.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileWorkspace() {
  const [activeSection, setActiveSection] =
    useState<SectionId>("basic");
  const [visitedSections, setVisitedSections] = useState<Set<SectionId>>(
    () => new Set(["basic"]),
  );
  const [resumeAutoFillRequest, setResumeAutoFillRequest] = useState(0);
  const desktopButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mobileButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectSection(section: SectionId) {
    setActiveSection(section);
    setVisitedSections((current) => {
      if (current.has(section)) {
        return current;
      }

      const next = new Set(current);
      next.add(section);
      return next;
    });
  }

  function startResumeAutoFill() {
    setResumeAutoFillRequest((current) => current + 1);
    selectSection("resumes");
  }

  const activeSectionDetails = sections.find(
    (section) => section.id === activeSection,
  )!;

  return (
    <>
      <div className="mb-6 overflow-x-auto pb-2 lg:hidden">
        <ProfileNavigation
          activeSection={activeSection}
          onSelect={selectSection}
          buttonRefs={mobileButtonRefs}
          idPrefix="mobile"
          className="flex min-w-max gap-2"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <aside className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-24">
          <div className="hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
            <ProfileNavigation
              activeSection={activeSection}
              onSelect={selectSection}
              buttonRefs={desktopButtonRefs}
              idPrefix="desktop"
              className="space-y-1"
            />
          </div>

          <ProfileCompletionCard />
        </aside>

        <section
          className="order-1 min-w-0 lg:order-2"
          aria-label={`${activeSectionDetails.label} profile section`}
        >
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
            <p className="text-sm font-semibold text-blue-700">
              Profile section
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {activeSectionDetails.label}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {activeSectionDetails.description}
            </p>
          </div>

          {sections.map((section) => {
            const SectionComponent = section.component;
            const isActive = activeSection === section.id;

            return (
              <div
                key={section.id}
                id={`profile-panel-${section.id}`}
                role="tabpanel"
                aria-label={section.label}
                hidden={!isActive}
                tabIndex={0}
              >
                {visitedSections.has(section.id) ? section.id === "basic" ? (
                  <>
                    <section className="mb-6 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-7" aria-labelledby="resume-auto-fill-heading">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-2xl">
                          <p className="inline-flex items-center gap-2 text-sm font-bold text-blue-700"><Sparkles size={17} aria-hidden="true" /> Save time</p>
                          <h3 id="resume-auto-fill-heading" className="mt-2 text-xl font-bold text-slate-950">Auto-Fill Profile with Resume</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">Upload your PDF or DOCX resume and we’ll prepare your personal information, experience, education, skills, and other profile details for review.</p>
                          <p className="mt-2 text-sm font-semibold text-slate-700">Nothing is added to your profile until you review and confirm it.</p>
                        </div>
                        <button type="button" onClick={startResumeAutoFill} className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">Upload Resume &amp; Auto-Fill</button>
                      </div>
                    </section>
                    <div className="mb-6 flex items-center gap-4" aria-hidden="true"><span className="h-px flex-1 bg-slate-200" /><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">or complete your information manually</span><span className="h-px flex-1 bg-slate-200" /></div>
                    <SectionComponent />
                  </>
                ) : section.id === "resumes" ? (
                  <ResumeManager autoFillRequest={resumeAutoFillRequest} />
                ) : (
                  <SectionComponent />
                ) : null}
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
