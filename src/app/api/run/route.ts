import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: "Remote code execution is disabled in Shiorivia Cloud." },
    { status: 403 },
  );
}
