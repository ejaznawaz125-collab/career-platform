type AuthLayoutProps = {
  children: React.ReactNode;
  banner: React.ReactNode;
};

export default function AuthLayout({
  children,
  banner,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">

        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

          {banner}

          <div className="flex items-center justify-center p-10">
            {children}
          </div>

        </div>

      </div>
    </main>
  );
}