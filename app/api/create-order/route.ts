import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the user session with Supabase
    const supabase = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const { amount, currency = 'INR', receipt, notes } = await request.json();

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt.substring(0, 40), // Razorpay receipt max length is 40 characters
      notes: {
        ...notes,
        user_id: user.id, // Add user ID to notes for tracking
        user_email: user.email,
      },
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(options);

    // Store order in our database for tracking
    try {
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

      const orderData = {
        razorpay_order_id: order.id,
        amount: order.amount, // Already in paise
        currency: order.currency,
        status: order.status,
        receipt: order.receipt,
        notes: {
          ...order.notes,
          user_id: user.id,
          user_email: user.email,
          original_amount: amount // Store original amount in rupees
        }
      };

      const { data: storedOrder, error: storeError } = await supabaseAdmin
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (storeError) {
        console.log('⚠️ Could not store order in database (table might not exist):', storeError.message);
        // Don't fail the request if we can't store the order
      } else {
        console.log('✅ Order stored in database:', storedOrder.id);
      }
    } catch (dbError: any) {
      console.log('⚠️ Database storage failed:', dbError.message);
      // Continue with the response even if database storage fails
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}