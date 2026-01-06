import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_url_value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anon_key_value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      service_role_key_value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
      razorpay_key_id: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      razorpay_key_secret: !!process.env.RAZORPAY_KEY_SECRET,
      node_env: process.env.NODE_ENV,
      all_env_keys: Object.keys(process.env).filter(key => 
        key.includes('SUPABASE') || key.includes('RAZORPAY')
      )
    };

    return NextResponse.json({
      success: true,
      environment: envCheck
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}