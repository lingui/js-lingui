import { NextResponse, NextRequest } from "next/server";
 
const locales = ['en', 'sr', 'es', 'pseudo']
 
export function middleware(req : NextRequest) {
  const { pathname } = req.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return
 
  const defaultLocale = 'en' // or find the "accept-language" in the header
  req.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(req.nextUrl)
}
 
export const config = {
  matcher: [
    '/((?!_next).*)',
  ],
}