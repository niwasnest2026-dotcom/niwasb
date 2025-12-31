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
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Auth exchange error:', error);
        throw error;
      }
      
      console.log('✅ Auth callback successful - User:', data.user?.email);
    } catch (error) {
      console.error('❌ Auth callback error:', error);
      // Still redirect to home even if there's an error
    }
  }

  // Force redirect to home page after Google OAuth
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.niwasnest.com';
  const homeUrl = `${siteUrl}/`;
  
  console.log('🏠 Redirecting to HOME PAGE:', homeUrl);
  console.log('🔧 Site URL from env:', process.env.NEXT_PUBLIC_SITE_URL);
  
  // Explicit redirect to home page
  return NextResponse.redirect(homeUrl);
}
