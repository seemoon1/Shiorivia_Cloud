import { NextResponse } from 'next/server';

const disabled = () => NextResponse.json(
  { error: "Legacy server-file storage is disabled in Shiorivia Cloud." },
  { status: 410 },
);

export async function GET() {
  return disabled();
}

export async function POST() {
  return disabled();
}

export async function DELETE() {
  return disabled();
}
