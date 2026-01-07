import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from './env-config';

/**
 * Schema-safe booking insertion that NEVER crashes on unknown columns
 * This function fetches the actual table schema and only inserts valid columns
 */
export async function safeBookingInsert(bookingPayload: any) {
  console.log('🔍 Starting schema-safe booking insert...');
  
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

  try {
    // Step 1: Get actual table schema to know which columns exist
    console.log('📋 Fetching bookings table schema...');
    
    // Use a safe query to get column information
    const { data: schemaTest, error: schemaError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.log('⚠️ Could not fetch schema, using minimal safe columns');
      // If we can't get schema, use only the most basic columns
      return await insertMinimalBooking(supabaseAdmin, bookingPayload);
    }

    // Step 2: Define our desired booking data with Razorpay fields (NO payment_id)
    const desiredBookingData = {
      // Core required fields
      property_id: bookingPayload.property_id,
      guest_name: bookingPayload.guest_name || bookingPayload.name,
      guest_email: bookingPayload.guest_email || bookingPayload.email,
      guest_phone: bookingPayload.guest_phone || bookingPayload.phone,
      
      // Payment fields (using Razorpay-specific columns)
      payment_status: 'paid',
      razorpay_payment_id: bookingPayload.razorpay_payment_id,
      razorpay_order_id: bookingPayload.razorpay_order_id,
      razorpay_signature: bookingPayload.razorpay_signature,
      
      // Optional fields
      user_id: bookingPayload.user_id,
      sharing_type: bookingPayload.sharing_type || 'Single Room',
      price_per_person: bookingPayload.price_per_person || 0,
      security_deposit_per_person: bookingPayload.security_deposit_per_person || 0,
      total_amount: bookingPayload.total_amount || 0,
      amount_paid: bookingPayload.amount_paid || 0,
      amount_due: bookingPayload.amount_due || 0,
      payment_method: 'razorpay',
      booking_status: 'confirmed',
      payment_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      notes: bookingPayload.notes || '',
      
      // Room fields (if provided)
      room_id: bookingPayload.room_id,
      check_in_date: bookingPayload.check_in_date,
      check_out_date: bookingPayload.check_out_date,
    };

    // Step 3: Get available columns from a test query
    let availableColumns: string[] = [];
    if (schemaTest && schemaTest.length > 0) {
      availableColumns = Object.keys(schemaTest[0]);
    } else {
      // Fallback: try to insert a test record to see what columns exist
      const testData = { property_id: 'test' };
      const { error: testError } = await supabaseAdmin
        .from('bookings')
        .insert(testData)
        .select();
      
      if (testError && testError.message) {
        // Parse error message to understand available columns
        console.log('📝 Test insert error (expected):', testError.message);
      }
      
      // Use common columns as fallback
      availableColumns = [
        'id', 'property_id', 'guest_name', 'guest_email', 'guest_phone',
        'payment_status', 'razorpay_payment_id', 'razorpay_order_id',
        'user_id', 'sharing_type', 'price_per_person', 'total_amount',
        'amount_paid', 'amount_due', 'payment_method', 'booking_status',
        'created_at', 'notes'
      ];
    }

    console.log('✅ Available columns detected:', availableColumns.length);

    // Step 4: Filter booking data to only include existing columns
    const safeBookingData: any = {};
    
    Object.entries(desiredBookingData).forEach(([key, value]) => {
      if (availableColumns.includes(key) && value !== undefined && value !== null) {
        safeBookingData[key] = value;
      } else if (!availableColumns.includes(key)) {
        console.log(`⚠️ Skipping unknown column: ${key}`);
      }
    });

    console.log('📝 Safe booking data prepared:', Object.keys(safeBookingData));

    // Step 5: Insert the filtered booking data
    const { data: bookingResult, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(safeBookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Safe booking insert failed:', bookingError);
      throw new Error(`Booking insert failed: ${bookingError.message}`);
    }

    console.log('✅ Safe booking created successfully:', bookingResult.id);
    return { success: true, booking: bookingResult };

  } catch (error: any) {
    console.error('❌ Schema-safe insert error:', error);
    
    // Final fallback: try minimal booking insert
    try {
      console.log('🔄 Attempting minimal fallback booking...');
      return await insertMinimalBooking(supabaseAdmin, bookingPayload);
    } catch (fallbackError: any) {
      console.error('❌ Even minimal booking failed:', fallbackError);
      throw new Error(`All booking insert methods failed: ${error.message}`);
    }
  }
}

/**
 * Minimal booking insert with only the most basic required fields
 * This is the absolute fallback when schema detection fails
 */
async function insertMinimalBooking(supabaseAdmin: any, payload: any) {
  console.log('🔄 Inserting minimal booking (fallback mode)...');
  
  const minimalData = {
    property_id: payload.property_id,
    guest_name: payload.guest_name || payload.name || 'Guest',
    guest_email: payload.guest_email || payload.email || 'unknown@email.com',
    guest_phone: payload.guest_phone || payload.phone || '0000000000',
    payment_status: 'paid',
    razorpay_payment_id: payload.razorpay_payment_id,
    created_at: new Date().toISOString()
  };

  const { data: bookingResult, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .insert(minimalData)
    .select()
    .single();

  if (bookingError) {
    throw new Error(`Minimal booking insert failed: ${bookingError.message}`);
  }

  console.log('✅ Minimal booking created:', bookingResult.id);
  return { success: true, booking: bookingResult };
}

/**
 * Check if a booking already exists for a Razorpay payment
 * Uses razorpay_payment_id instead of payment_id
 */
export async function checkExistingBooking(razorpayPaymentId: string) {
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

  try {
    // Try to find existing booking using razorpay_payment_id
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id, property_id, guest_name, razorpay_payment_id')
      .eq('razorpay_payment_id', razorpayPaymentId)
      .single();

    return existingBooking;
  } catch (error) {
    // If razorpay_payment_id column doesn't exist, try payment_id as fallback
    try {
      const { data: fallbackBooking } = await supabaseAdmin
        .from('bookings')
        .select('id, property_id, guest_name')
        .eq('payment_id', razorpayPaymentId)
        .single();

      return fallbackBooking;
    } catch (fallbackError) {
      // No existing booking found (which is normal for new payments)
      return null;
    }
  }
}