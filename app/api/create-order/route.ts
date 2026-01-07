import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: ENV_CONFIG.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating Razorpay order...');

    // Step 1: Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Step 2: Verify user session
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
      console.log('❌ Authentication failed:', authError?.message);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Step 3: Validate request payload
    const { propertyId, amount, userDetails } = await request.json();

    if (!propertyId || !amount || !userDetails) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: propertyId, amount, userDetails' },
        { status: 400 }
      );
    }

    // Step 4: Validate property exists (server-side validation)
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name, price')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      console.log('❌ Property not found:', propertyId);
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    console.log('✅ Property validated:', property.name);

    // Step 5: Create Razorpay order (NO booking creation here)
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${propertyId.slice(-8)}`, // Unique receipt
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
    console.log('✅ Razorpay order created:', order.id);

    // Step 6: Return order details (NO booking created yet)
    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      // Include property and user details for frontend
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
    console.error('❌ Order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create order',
      },
      { status: 500 }
    );
  }
}