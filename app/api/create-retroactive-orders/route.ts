import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating retroactive orders for existing payments...');

    // Create admin client
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

    const fixes = [];
    const errors = [];

    // 1. Find bookings with payment_id but no order record
    console.log('🔍 Finding bookings with payments but no orders...');
    const { data: bookingsWithPayments, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id, payment_id, amount_paid, guest_name, guest_email, guest_phone, properties(name), created_at')
      .not('payment_id', 'is', null)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      errors.push(`Error fetching bookings: ${bookingsError.message}`);
      return NextResponse.json({
        success: false,
        error: bookingsError.message,
        fixes: [],
        errors: [bookingsError.message]
      }, { status: 500 });
    }

    if (!bookingsWithPayments || bookingsWithPayments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No bookings with payments found',
        fixes: ['No retroactive orders needed'],
        errors: [],
        orders_created: 0
      });
    }

    console.log(`📋 Found ${bookingsWithPayments.length} bookings with payments`);

    // 2. Create orders table if it doesn't exist
    console.log('🔧 Ensuring orders table exists...');
    
    // First check if orders table exists by trying to select from it
    const { data: ordersTest, error: ordersTestError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1);

    if (ordersTestError && ordersTestError.message.includes('does not exist')) {
      console.log('📝 Creating orders table...');
      
      // Create orders table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          booking_id UUID REFERENCES bookings(id),
          razorpay_order_id TEXT UNIQUE,
          razorpay_payment_id TEXT,
          amount INTEGER NOT NULL,
          currency TEXT DEFAULT 'INR',
          status TEXT DEFAULT 'created',
          receipt TEXT,
          notes JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_orders_booking_id ON orders(booking_id);
        CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
        CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
      `;

      try {
        // Use raw SQL execution (this might not work with Supabase client directly)
        // Instead, we'll create the table structure through API calls
        console.log('⚠️ Orders table creation needs to be done manually in Supabase dashboard');
        fixes.push('Orders table structure defined (needs manual creation in Supabase)');
      } catch (sqlError: any) {
        console.log('⚠️ Could not create orders table automatically:', sqlError.message);
        fixes.push('Orders table creation attempted (may need manual setup)');
      }
    } else {
      fixes.push('Orders table already exists');
    }

    // 3. For each booking with payment, create a retroactive order record
    let ordersCreated = 0;
    
    for (const booking of bookingsWithPayments) {
      try {
        // Check if order already exists for this booking
        const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('booking_id', booking.id)
          .single();

        if (existingOrder) {
          console.log(`⏭️ Order already exists for booking ${booking.id}`);
          continue;
        }

        // Create retroactive order data
        const orderData = {
          booking_id: booking.id,
          razorpay_order_id: `order_retro_${booking.payment_id}`, // Create synthetic order ID
          razorpay_payment_id: booking.payment_id,
          amount: booking.amount_paid * 100, // Convert to paise
          currency: 'INR',
          status: 'paid', // Since payment was already successful
          receipt: `booking_${booking.id}`,
          notes: {
            booking_id: booking.id,
            property_name: booking.properties?.name || 'Unknown Property',
            guest_name: booking.guest_name,
            retroactive: true,
            created_from: 'existing_payment'
          },
          created_at: booking.created_at, // Use original booking date
          updated_at: new Date().toISOString()
        };

        console.log(`📝 Creating retroactive order for booking ${booking.id}...`);

        // Try to insert the order
        const { data: newOrder, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        if (orderError) {
          if (orderError.message.includes('does not exist')) {
            errors.push(`Orders table does not exist. Please create it manually in Supabase dashboard.`);
            break; // Stop processing if table doesn't exist
          } else {
            errors.push(`Failed to create order for booking ${booking.id}: ${orderError.message}`);
          }
        } else {
          fixes.push(`Created retroactive order for booking ${booking.id} (Payment: ${booking.payment_id})`);
          ordersCreated++;
          console.log(`✅ Created order ${newOrder.id} for booking ${booking.id}`);
        }

      } catch (error: any) {
        errors.push(`Error processing booking ${booking.id}: ${error.message}`);
      }
    }

    // 4. Create a summary of what was done
    const summary = {
      success: errors.length === 0 || ordersCreated > 0,
      message: `Processed ${bookingsWithPayments.length} bookings with payments`,
      orders_created: ordersCreated,
      fixes_applied: fixes.length,
      errors_found: errors.length,
      fixes: fixes,
      errors: errors,
      table_creation_sql: `
-- Run this SQL in your Supabase SQL editor if orders table doesn't exist:

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',
  receipt TEXT,
  notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_booking_id ON orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
      `.trim()
    };

    console.log('✅ Retroactive orders creation completed');
    
    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('❌ Create retroactive orders error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      orders_created: 0,
      fixes_applied: 0,
      errors_found: 1,
      fixes: [],
      errors: [error.message]
    }, { status: 500 });
  }
}