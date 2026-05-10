// Auth was removed for the demo deployment. This route returns 404.
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({ error: 'Auth removed' }, { status: 404 });
}

export const POST = GET;
