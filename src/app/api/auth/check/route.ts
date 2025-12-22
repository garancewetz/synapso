import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAuth(request);
  
  return NextResponse.json({ authenticated: isAuthenticated });
}

