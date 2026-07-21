import type { Metadata } from "next";
import "./globals.css";

import AuthProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Career Platform",
  description: "Find verified jobs across Asia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}