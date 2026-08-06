import { auth } from "@/auth";
import { NextResponse } from "next/server";


export default auth((req) => {
  const user = req.auth;

  const pathname = req.nextUrl.pathname;


  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employer") ||
    pathname.startsWith("/admin")
  ) {

    if (!user) {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }

  }


  if (
    pathname.startsWith("/admin")
  ) {

    if (
      user?.user?.role !== "ADMIN" &&
      user?.user?.role !== "SUPER_ADMIN"
    ) {

      return NextResponse.redirect(
        new URL("/", req.url)
      );

    }

  }


  if (
    pathname.startsWith("/employer")
  ) {

    if (
      user?.user?.role !== "EMPLOYER" &&
      user?.user?.role !== "ADMIN" &&
      user?.user?.role !== "SUPER_ADMIN"
    ) {

      return NextResponse.redirect(
        new URL("/", req.url)
      );

    }

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