import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { parseAccess } from '@repo/design_system/lib/access'
import { gateRedirect } from '@/lib/admin/access-gate'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/accept-invite(.*)', '/sem-acesso'])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next()

  let sessionClaims
  try {
    sessionClaims = (await auth.protect()).sessionClaims
  } catch (err) {
    // Redirect to custom sign-in page
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // Fast gate from the session token; the server re-checks with requireAdmin() before any data.
  const redirect = gateRedirect(req.nextUrl.pathname, parseAccess(sessionClaims?.openldr))
  if (redirect) return NextResponse.redirect(new URL(redirect, req.url))
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
