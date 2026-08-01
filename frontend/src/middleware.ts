import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Authentication check is bypassed for local frontend sandbox demo
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
