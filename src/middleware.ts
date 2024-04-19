export { default } from "next-auth/middleware"

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getToken } from "next-auth/jwt"
 
export async function middleware(request: NextRequest) {

  const currentUrl = request.nextUrl
  const token = await getToken({ req: request })

  if(token && (
        currentUrl.pathname.startsWith("/sign-in") || 
        currentUrl.pathname.startsWith("/sign-up") || 
        currentUrl.pathname.startsWith("/verify") || 
        currentUrl.pathname.startsWith("/")
      )
    ){
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if(!token && currentUrl.pathname.startsWith("/dashboard")){
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "sign-in",
    "sign-up",
    "dashboard/:path*",
    "verify/:path*"
  ],
}