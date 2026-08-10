import ResumeManager from "@/components/profile/ResumeManager";

export default function CandidateResumePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          My Resume
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Upload and manage private resumes, versions, categories, downloads,
          defaults, and reviewed profile imports.
        </p>
      </div>

      <ResumeManager />
    </div>
  );
}
