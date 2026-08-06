import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((request) => {
  const session = request.auth;
  const pathname = request.nextUrl.pathname;

  const isDashboardRoute =
    pathname.startsWith("/dashboard");

  const isEmployerRoute =
    pathname.startsWith("/employer");

  const isAdminRoute =
    pathname.startsWith("/admin");

  if (
    (isDashboardRoute ||
      isEmployerRoute ||
      isAdminRoute) &&
    !session
  ) {
    const loginUrl = new URL(
      "/login",
      request.url,
    );

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname,
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  const role =
    session?.user?.role;

  if (
    isAdminRoute &&
    role !== "ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/", request.url),
    );
  }

  if (
    isEmployerRoute &&
    role !== "EMPLOYER" &&
    role !== "ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/", request.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employer/:path*",
    "/admin/:path*",
  ],
};