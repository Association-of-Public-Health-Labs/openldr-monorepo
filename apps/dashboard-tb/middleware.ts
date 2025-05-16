import { clerkMiddleware } from "@clerk/nextjs/server";

const publicRoutes = ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/public(.*)"];

export default clerkMiddleware((auth, req) => {
  if (publicRoutes.some(route => new RegExp(route).test(req.url))) {
    return;
  }
  return (auth() as any).protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"], // Match all except static files
};