import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: { nextUrl: { pathname: any; }; url: string | URL | undefined; }) {

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next(); 
  }

  // If no token exists  redirect to login page
  if (!token) {
    const url = new URL("/", req.url); 
    url.searchParams.set("message", "Session expired. Please log in again.");
    return NextResponse.redirect(url);
  }

  // Restrict non-admins from accessing admin dashboard routes
  if (pathname.startsWith("/dashboard/user") && pathname !== "/dashboard/home" && token.role !== "admin") {
    const url = new URL("/error", req.url);
    url.searchParams.set("message", "Access denied. You are not authorized.");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*","/dashboard/import","/dashboard/download","/notifications"  ,"/profile","/users/:path*"],
};
