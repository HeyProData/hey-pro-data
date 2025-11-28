import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/:path*", "/", "/profile", "/dashboard", "/login", "/signup"],
};

const authRoutes = ["/signup", "/login"];
const protectedRoutes = ["/test"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value || null; // Get the token from cookies

  // console.log("Middleware token:", token);

  const url = request.nextUrl.pathname;

  const isAuthRoute = authRoutes.some((route) => url.startsWith(route));
  const isProtactedRoute = protectedRoutes.some((route) =>
    url.startsWith(route)
  );

  if (!token && !isAuthRoute && isProtactedRoute) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${url}`, request.url)
    );
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}
