import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Razorpay signature verification...');

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = await request.json();

    // Check if we have the secret key
    const hasSecret = !!ENV_CONFIG.RAZORPAY_KEY_SECRET;
    const secretLength = ENV_CONFIG.RAZORPAY_KEY_SECRET?.length || 0;

    console.log('🔍 Environment check:', {
      has_secret: hasSecret,
      secret_length: secretLength,
      secret_preview: ENV_CONFIG.RAZORPAY_KEY_SECRET?.substring(0, 4) + '...'
    });

    if (!hasSecret) {
      return NextResponse.json({
        success: false,
        error: 'RAZORPAY_KEY_SECRET not found in environment',
        debug: {
          env_keys: Object.keys(process.env).filter(key => key.includes('RAZORPAY')),
          node_env: process.env.NODE_ENV
        }
      });
    }

    // Generate signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', ENV_CONFIG.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    console.log('🔐 Signature verification test:', {
      body_string: body,
      expected_signature: expectedSignature,
      received_signature: razorpay_signature,
      signatures_match: isValid
    });

    return NextResponse.json({
      success: true,
      verification_result: {
        is_valid: isValid,
        body_string: body,
        expected_signature: expectedSignature,
        received_signature: razorpay_signature,
        secret_available: hasSecret,
        secret_length: secretLength
      },
      environment_info: {
        node_env: process.env.NODE_ENV,
        razorpay_env_vars: Object.keys(process.env).filter(key => key.includes('RAZORPAY'))
      }
    });

  } catch (error: any) {
    console.error('❌ Razorpay verification test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Razorpay verification test endpoint',
    usage: 'POST with { razorpay_order_id, razorpay_payment_id, razorpay_signature }',
    environment: {
      has_secret: !!ENV_CONFIG.RAZORPAY_KEY_SECRET,
      secret_length: ENV_CONFIG.RAZORPAY_KEY_SECRET?.length || 0,
      node_env: process.env.NODE_ENV
    }
  });
}