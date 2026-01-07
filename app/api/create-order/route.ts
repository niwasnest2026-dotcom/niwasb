import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: ENV_CONFIG.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user session
    const supabase = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Parse request body
    const { propertyId, amount, userDetails } = await request.json();

    // Validate required fields
    if (!propertyId || !amount || !userDetails?.name || !userDetails?.email || !userDetails?.phone) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate property exists
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name, price')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, message: 'Property not available' },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${propertyId.slice(-8)}`,
      notes: {
        property_id: propertyId,
        property_name: property.name,
        user_id: user.id,
        user_email: user.email,
        guest_name: userDetails.name,
        guest_email: userDetails.email,
        guest_phone: userDetails.phone
      },
    };

    const order = await razorpay.orders.create(orderOptions as any) as any;

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      property: {
        id: property.id,
        name: property.name
      },
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to create payment order',
      },
      { status: 500 }
    );
  }
}