import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';
import { validateForAPI, StandardizedPaymentInput } from '@/lib/payment-validation';

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: ENV_CONFIG.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating Razorpay order with standardized input...');

    // Step 1: Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
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
        { success: false, message: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Step 3: Parse request body (ONLY request body, NO query params)
    let requestBody: StandardizedPaymentInput;
    
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.log('❌ Invalid JSON payload');
      return NextResponse.json(
        { success: false, message: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Step 4: STRICT VALIDATION using utility (NO 500 errors for user mistakes)
    const validationResult = validateForAPI(requestBody);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: validationResult.message
        },
        { status: validationResult.statusCode }
      );
    }

    const { propertyId, amount, userDetails } = requestBody;

    console.log('✅ Payload validation passed:', {
      propertyId,
      amount,
      userName: userDetails.name,
      userEmail: userDetails.email
    });

    // Step 5: Validate property exists (server-side validation)
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
        { success: false, message: 'Property not available' },
        { status: 404 }
      );
    }

    console.log('✅ Property validated:', property.name);

    // Step 6: Create Razorpay order (NO booking creation here)
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

    // Step 7: Return standardized response
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
    console.error('❌ Order creation error:', error);
    
    // Don't expose internal errors to frontend
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to create payment order',
      },
      { status: 500 }
    );
  }
}