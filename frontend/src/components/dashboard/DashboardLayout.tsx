type DashboardLayoutProps = {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
};

export default function DashboardLayout({
  sidebar,
  header,
  children,
}: DashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="lg:flex">

        <aside className="hidden min-h-screen w-72 bg-white shadow-lg lg:block">
          {sidebar}
        </aside>

        <section className="min-w-0 flex-1">

          {header}

          <div className="border-b border-slate-200 bg-white p-4 lg:hidden">
            {sidebar}
          </div>

          <div className="p-4 sm:p-8">
            {children}
          </div>

        </section>

      </div>
    </main>
  );
}
