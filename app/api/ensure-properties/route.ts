import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Checking if properties exist...');

    // Check if any properties exist
    const { data: existingProperties, error: checkError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking properties:', checkError);
      return NextResponse.json({ 
        success: false, 
        error: checkError.message,
        propertiesExist: false,
        count: 0
      });
    }

    const propertiesExist = existingProperties && existingProperties.length > 0;
    console.log('✅ Properties check result:', propertiesExist ? 'Found' : 'None found');

    if (!propertiesExist) {
      console.log('🏗️ No properties found, adding sample properties...');
      
      // Add sample properties
      const sampleProperties = [
        {
          name: 'Sunrise PG for Students',
          price: 12000,
          area: 'MG Road',
          city: 'Bangalore',
          address: '123 MG Road, Near Metro Station, Bangalore 560001',
          featured_image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
          property_type: 'PG',
          gender_preference: 'any',
          rating: 4.5,
          description: 'Modern PG accommodation perfect for students and working professionals.',
          security_deposit: 24000,
          verified: true,
          instant_book: true,
          secure_booking: true
        },
        {
          name: 'Green Valley PG',
          price: 10000,
          area: 'Koramangala',
          city: 'Bangalore',
          address: '456 Koramangala 5th Block, Bangalore 560095',
          featured_image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          property_type: 'PG',
          gender_preference: 'boys',
          rating: 4.2,
          description: 'Comfortable PG with all modern amenities in prime location.',
          security_deposit: 20000,
          verified: true,
          instant_book: false,
          secure_booking: true
        },
        {
          name: 'Elite Residency',
          price: 15000,
          area: 'Brigade Road',
          city: 'Bangalore',
          address: '789 Brigade Road, Commercial Street, Bangalore 560025',
          featured_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
          property_type: 'PG',
          gender_preference: 'girls',
          rating: 4.8,
          description: 'Premium PG accommodation with luxury amenities and 24/7 security.',
          security_deposit: 30000,
          verified: true,
          instant_book: true,
          secure_booking: true
        }
      ];

      const { data: insertedProperties, error: insertError } = await supabase
        .from('properties')
        .insert(sampleProperties)
        .select('id');

      if (insertError) {
        console.error('❌ Error inserting properties:', insertError);
        return NextResponse.json({ 
          success: false, 
          error: insertError.message,
          propertiesExist: false,
          count: 0
        });
      }

      console.log('✅ Sample properties added:', insertedProperties?.length || 0);

      return NextResponse.json({ 
        success: true, 
        message: 'Sample properties added successfully',
        propertiesExist: true,
        count: insertedProperties?.length || 0,
        wasEmpty: true
      });
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({ 
      success: true, 
      message: 'Properties already exist',
      propertiesExist: true,
      count: count || 0,
      wasEmpty: false
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unexpected error occurred',
      propertiesExist: false,
      count: 0
    });
  }
}

export async function POST() {
  return GET(); // Same logic for POST requests
}