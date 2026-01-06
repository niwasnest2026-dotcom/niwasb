import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function GET(request: NextRequest) {
  try {
    console.log('🏠 Getting sample property for booking...');

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

    // Get any available property
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name, price, city, area')
      .limit(1)
      .single();

    if (propertyError || !property) {
      console.log('❌ No properties found, creating sample property...');
      
      // Create a sample property if none exists
      const sampleProperty = {
        name: 'NiwasNest Sample PG',
        description: 'Auto-generated property for booking system',
        address: '123 Sample Street, Koramangala',
        city: 'Bangalore',
        area: 'Koramangala',
        property_type: 'PG',
        price: 8000,
        original_price: 10000,
        security_deposit: 16000,
        available_months: 12,
        rating: 4.2,
        review_count: 25,
        instant_book: true,
        verified: true,
        secure_booking: true,
        featured_image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        gender_preference: 'any',
        owner_name: 'Property Manager',
        owner_phone: '9876543210',
        payment_instructions: 'Pay remaining 80% amount directly to property owner after moving in'
      };

      const { data: newProperty, error: createError } = await supabaseAdmin
        .from('properties')
        .insert(sampleProperty)
        .select('id, name, price, city, area')
        .single();

      if (createError) {
        console.error('❌ Failed to create sample property:', createError);
        return NextResponse.json({
          success: false,
          error: 'No properties available and failed to create sample property'
        }, { status: 500 });
      }

      console.log('✅ Created sample property:', newProperty.name);
      
      return NextResponse.json({
        success: true,
        property: newProperty,
        message: 'Sample property created for booking'
      });
    }

    console.log('✅ Found property for booking:', property.name);
    
    return NextResponse.json({
      success: true,
      property: property,
      message: 'Property found for booking'
    });

  } catch (error: any) {
    console.error('❌ Get sample property error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}