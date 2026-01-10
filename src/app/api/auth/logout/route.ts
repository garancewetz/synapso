import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/app/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return clearAuthCookie(response);
}

