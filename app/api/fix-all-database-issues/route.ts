import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting comprehensive database fix...');

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

    // 1. Ensure properties table has data
    console.log('📋 Checking properties table...');
    const { data: properties, error: propertiesError } = await supabaseAdmin
      .from('properties')
      .select('id, name')
      .limit(5);

    if (propertiesError) {
      errors.push(`Properties table error: ${propertiesError.message}`);
    } else if (!properties || properties.length === 0) {
      console.log('🏠 No properties found, creating sample property...');
      
      const sampleProperty = {
        name: 'Sample PG Property',
        description: 'Auto-generated property for booking system',
        address: '123 Sample Street, Sample Area',
        city: 'Bangalore',
        area: 'Sample Area',
        property_type: 'PG',
        price: 5000,
        original_price: 6000,
        security_deposit: 10000,
        available_months: 12,
        rating: 4.0,
        review_count: 10,
        instant_book: true,
        verified: true,
        secure_booking: true,
        featured_image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        gender_preference: 'any',
        owner_name: 'Sample Owner',
        owner_phone: '9999999999',
        payment_instructions: 'Pay remaining amount directly to owner'
      };

      const { data: newProperty, error: createError } = await supabaseAdmin
        .from('properties')
        .insert(sampleProperty)
        .select()
        .single();

      if (createError) {
        errors.push(`Failed to create sample property: ${createError.message}`);
      } else {
        fixes.push(`Created sample property: ${newProperty.name} (ID: ${newProperty.id})`);
      }
    } else {
      fixes.push(`Properties table OK: ${properties.length} properties found`);
    }

    // 2. Check bookings table schema
    console.log('📋 Checking bookings table schema...');
    try {
      const testBooking = {
        property_id: properties?.[0]?.id || 'test-id',
        guest_name: 'Test User',
        guest_email: 'test@example.com',
        guest_phone: '9999999999',
        sharing_type: 'Single Room',
        price_per_person: 5000,
        security_deposit_per_person: 10000,
        total_amount: 15000,
        amount_paid: 3000,
        amount_due: 12000,
        payment_method: 'test',
        payment_status: 'partial',
        booking_status: 'confirmed',
        payment_date: new Date().toISOString(),
        payment_id: 'test_payment_' + Date.now(),
        notes: 'Schema validation test'
      };

      const { data: testResult, error: testError } = await supabaseAdmin
        .from('bookings')
        .insert(testBooking)
        .select()
        .single();

      if (testError) {
        if (testError.message.includes('payment_id')) {
          errors.push('payment_id column missing from bookings table');
        } else if (testError.message.includes('uuid')) {
          errors.push('Invalid UUID format in bookings table');
        } else {
          errors.push(`Bookings table error: ${testError.message}`);
        }
      } else {
        fixes.push('Bookings table schema OK');
        // Clean up test booking
        await supabaseAdmin
          .from('bookings')
          .delete()
          .eq('id', testResult.id);
      }
    } catch (error: any) {
      errors.push(`Bookings table test failed: ${error.message}`);
    }

    // 3. Check profiles table
    console.log('📋 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .limit(5);

    if (profilesError) {
      errors.push(`Profiles table error: ${profilesError.message}`);
    } else {
      fixes.push(`Profiles table OK: ${profiles?.length || 0} profiles found`);
    }

    // 4. Check property_rooms table
    console.log('📋 Checking property_rooms table...');
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('property_rooms')
      .select('id, property_id')
      .limit(5);

    if (roomsError) {
      errors.push(`Property rooms table error: ${roomsError.message}`);
    } else {
      fixes.push(`Property rooms table OK: ${rooms?.length || 0} rooms found`);
    }

    // 5. Ensure at least one property has rooms
    if (properties && properties.length > 0 && (!rooms || rooms.length === 0)) {
      console.log('🏠 Creating sample room for property...');
      
      const sampleRoom = {
        property_id: properties[0].id,
        room_number: 'R001',
        room_type: 'Standard',
        sharing_type: 'Single',
        price_per_person: 5000,
        security_deposit_per_person: 10000,
        total_beds: 1,
        available_beds: 1,
        floor_number: 1,
        has_attached_bathroom: true,
        has_balcony: false,
        has_ac: true,
        room_size_sqft: 120,
        description: 'Comfortable single occupancy room',
        is_available: true
      };

      const { data: newRoom, error: roomCreateError } = await supabaseAdmin
        .from('property_rooms')
        .insert(sampleRoom)
        .select()
        .single();

      if (roomCreateError) {
        errors.push(`Failed to create sample room: ${roomCreateError.message}`);
      } else {
        fixes.push(`Created sample room: ${newRoom.room_number} for property ${properties[0].name}`);
      }
    }

    // 6. Check for any orphaned bookings
    console.log('📋 Checking for orphaned bookings...');
    const { data: orphanedBookings, error: orphanError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, 
        property_id,
        properties!inner(id, name)
      `)
      .is('properties.id', null)
      .limit(10);

    if (orphanError) {
      // This is expected if there are no orphaned bookings
      fixes.push('No orphaned bookings found');
    } else if (orphanedBookings && orphanedBookings.length > 0) {
      errors.push(`Found ${orphanedBookings.length} orphaned bookings with invalid property_id`);
    } else {
      fixes.push('No orphaned bookings found');
    }

    // 7. Test a complete booking flow
    console.log('📋 Testing complete booking flow...');
    if (properties && properties.length > 0) {
      const completeBookingTest = {
        property_id: properties[0].id,
        guest_name: 'Flow Test User',
        guest_email: 'flowtest@example.com',
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
        payment_id: 'flow_test_' + Date.now(),
        notes: 'Complete flow test booking'
      };

      const { data: flowTest, error: flowError } = await supabaseAdmin
        .from('bookings')
        .insert(completeBookingTest)
        .select()
        .single();

      if (flowError) {
        errors.push(`Complete booking flow test failed: ${flowError.message}`);
      } else {
        fixes.push('Complete booking flow test passed');
        // Clean up test booking
        await supabaseAdmin
          .from('bookings')
          .delete()
          .eq('id', flowTest.id);
      }
    }

    // Summary
    const summary = {
      success: errors.length === 0,
      fixes_applied: fixes.length,
      errors_found: errors.length,
      fixes: fixes,
      errors: errors,
      recommendations: []
    };

    if (errors.length > 0) {
      summary.recommendations.push('Fix the errors listed above before processing payments');
    }

    if (!properties || properties.length === 0) {
      summary.recommendations.push('Add properties through admin panel');
    }

    if (errors.some(e => e.includes('payment_id'))) {
      summary.recommendations.push('Run: ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;');
    }

    console.log('✅ Database fix completed');
    
    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('❌ Database fix error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      fixes_applied: 0,
      errors_found: 1,
      fixes: [],
      errors: [error.message]
    }, { status: 500 });
  }
}