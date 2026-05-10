// Auth was removed for the demo deployment. Middleware is a no-op passthrough.
// (Keeping the file so any cached references still resolve. Safe to delete.)
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

// Empty matcher — middleware never actually runs.
export const config = {
  matcher: [],
};
