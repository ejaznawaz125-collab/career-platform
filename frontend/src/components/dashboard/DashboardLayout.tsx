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
      <div className="flex">

        <aside className="hidden min-h-screen w-72 bg-white shadow-lg lg:block">
          {sidebar}
        </aside>

        <section className="flex-1">

          {header}

          <div className="p-8">
            {children}
          </div>

        </section>

      </div>
    </main>
  );
}