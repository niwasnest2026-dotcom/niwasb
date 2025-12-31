import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('🔐 Auth callback received:', {
    url: request.url,
    origin: requestUrl.origin,
    code: code ? 'present' : 'missing'
  });

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      console.log('🔐 Exchanging code for session...');
      await supabase.auth.exchangeCodeForSession(code);
      console.log('✅ Auth callback successful');
    } catch (error) {
      console.error('❌ Auth callback error:', error);
      // Still redirect to home even if there's an error
    }
  }

  // Force redirect to production domain using environment variable
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.niwasnest.com';
  const redirectUrl = `${siteUrl}/`;
  
  console.log('🔐 Redirecting to:', redirectUrl);
  console.log('🔧 Site URL from env:', process.env.NEXT_PUBLIC_SITE_URL);
  
  return NextResponse.redirect(redirectUrl);
}
