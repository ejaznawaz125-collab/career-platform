import { ReactNode } from "react";

type JobsLayoutProps = {
  filters: ReactNode;
  jobs: ReactNode;
};

export default function JobsLayout({
  filters,
  jobs,
}: JobsLayoutProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          {filters}
        </aside>

        <div className="lg:col-span-3">
          {jobs}
        </div>
      </div>
    </section>
  );
}