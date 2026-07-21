import { ShieldCheck } from "lucide-react";

export default function AuthBanner() {
  return (
    <div className="hidden bg-gradient-to-br from-blue-700 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-center">

      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
        <ShieldCheck size={42} />
      </div>

      <h2 className="text-5xl font-bold leading-tight">
        Build Your Career With Confidence
      </h2>

      <p className="mt-8 text-lg leading-8 text-blue-100">
        Discover verified companies, apply to thousands of jobs,
        build AI-powered resumes and grow your professional career.
      </p>

    </div>
  );
}