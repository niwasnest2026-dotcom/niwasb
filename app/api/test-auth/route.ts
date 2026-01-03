import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'No authorization header found',
        headers: Object.fromEntries(request.headers.entries())
      });
    }

    // Verify the user session with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({
        success: false,
        error: 'Auth error: ' + authError.message,
        authHeader: authHeader.substring(0, 50) + '...'
      });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No user found',
        authHeader: authHeader.substring(0, 50) + '...'
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      },
      message: 'Authentication successful'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}