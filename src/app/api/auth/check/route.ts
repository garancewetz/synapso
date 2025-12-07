import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAuth(request);
  
  return NextResponse.json({ authenticated: isAuthenticated });
}

