import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting bookings schema fix...');

    // Validate required environment variables
    const requiredEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars);
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing environment variables: ${missingVars.join(', ')}. Please configure them in your deployment platform.`
        },
        { status: 500 }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // First, let's check the current schema
    console.log('📋 Checking current bookings table schema...');
    
    // Try to describe the table structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error checking table:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check bookings table: ' + tableError.message
      }, { status: 500 });
    }

    console.log('✅ Bookings table exists');

    // Try to add payment_id column if it doesn't exist
    console.log('🔄 Ensuring payment_id column exists...');
    
    try {
      // Use raw SQL to add column if not exists
      const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'bookings' 
              AND column_name = 'payment_id'
            ) THEN
              ALTER TABLE bookings ADD COLUMN payment_id TEXT;
              RAISE NOTICE 'Added payment_id column to bookings table';
            ELSE
              RAISE NOTICE 'payment_id column already exists';
            END IF;
          END $$;
        `
      });

      if (sqlError) {
        console.log('⚠️ SQL function not available, trying direct approach...');
        
        // Try a simple insert to test if payment_id column exists
        const testData = {
          property_id: 'test',
          guest_name: 'Test',
          guest_email: 'test@test.com',
          guest_phone: '1234567890',
          sharing_type: 'Single',
          price_per_person: 1000,
          security_deposit_per_person: 2000,
          total_amount: 3000,
          amount_paid: 600,
          amount_due: 2400,
          payment_method: 'test',
          payment_id: 'test_payment_id'
        };

        const { data: testInsert, error: testError } = await supabaseAdmin
          .from('bookings')
          .insert(testData)
          .select()
          .single();

        if (testError) {
          if (testError.message.includes('payment_id')) {
            console.log('❌ payment_id column missing, need manual database update');
            return NextResponse.json({
              success: false,
              error: 'payment_id column is missing from bookings table',
              solution: 'Please run this SQL in your Supabase SQL editor: ALTER TABLE bookings ADD COLUMN payment_id TEXT;',
              test_error: testError.message
            }, { status: 500 });
          } else {
            console.log('⚠️ Test insert failed for other reason:', testError.message);
          }
        } else {
          console.log('✅ payment_id column exists, cleaning up test data...');
          // Clean up test data
          await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('id', testInsert.id);
        }
      } else {
        console.log('✅ SQL executed successfully');
      }
    } catch (error: any) {
      console.error('❌ Error checking/adding payment_id column:', error);
    }

    // Test a real booking insert with payment_id
    console.log('🧪 Testing booking creation with payment_id...');
    
    const testBookingData = {
      property_id: 'test-property-id',
      guest_name: 'Test User',
      guest_email: 'test@example.com',
      guest_phone: '9999999999',
      sharing_type: 'Single Room',
      price_per_person: 5000,
      security_deposit_per_person: 10000,
      total_amount: 15000,
      amount_paid: 3000,
      amount_due: 12000,
      payment_method: 'razorpay',
      payment_status: 'partial',
      booking_status: 'confirmed',
      payment_date: new Date().toISOString(),
      payment_id: 'test_payment_' + Date.now(),
      notes: 'Schema test booking'
    };

    const { data: testBooking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(testBookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Test booking creation failed:', bookingError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create test booking: ' + bookingError.message,
        details: bookingError
      }, { status: 500 });
    }

    console.log('✅ Test booking created successfully:', testBooking.id);

    // Clean up test booking
    await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', testBooking.id);

    console.log('✅ Test booking cleaned up');

    // Check existing bookings
    const { data: existingBookings, error: existingError } = await supabaseAdmin
      .from('bookings')
      .select('id, payment_id, guest_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Bookings schema is working correctly',
      test_booking_id: testBooking.id,
      existing_bookings_count: existingBookings?.length || 0,
      recent_bookings: existingBookings || []
    });

  } catch (error: any) {
    console.error('❌ Schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}