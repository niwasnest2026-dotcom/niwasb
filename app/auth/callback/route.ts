import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Auth callback error:', error);
      // Still redirect to home even if there's an error
    }
  }

  // Always redirect to the home page of the current domain
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
