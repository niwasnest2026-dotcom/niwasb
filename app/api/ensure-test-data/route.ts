import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Ensuring test data exists...');

    // Check if properties exist
    const { data: existingProperties, error: fetchError } = await supabase
      .from('properties')
      .select('id, name, owner_name')
      .limit(3);

    if (fetchError) {
      throw new Error('Failed to fetch properties: ' + fetchError.message);
    }

    let results = [];

    // If no properties exist, create them
    if (!existingProperties || existingProperties.length === 0) {
      console.log('📝 Creating sample properties...');
      
      const sampleProperties = [
        {
          name: 'Sunrise PG for Students',
          description: 'Modern PG accommodation perfect for students and working professionals.',
          address: 'MG Road, Near Metro Station',
          city: 'Bangalore',
          area: 'MG Road',
          price: 12000,
          security_deposit: 24000,
          available_months: 12,
          property_type: 'PG',
          gender_preference: 'boys',
          owner_name: 'Rajesh Kumar',
          owner_phone: '+91 98765 43210',
          payment_instructions: 'Please pay the remaining amount via UPI: rajesh@paytm or Bank Transfer:\nAccount No: 1234567890\nIFSC: SBIN0001234\nAccount Name: Rajesh Kumar',
          featured_image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
          rating: 4.5,
          verified: true,
          instant_book: true,
          secure_booking: true,
          is_available: true
        },
        {
          name: 'Green Valley PG',
          description: 'Comfortable and affordable PG with excellent facilities.',
          address: 'Koramangala 5th Block',
          city: 'Bangalore',
          area: 'Koramangala',
          price: 10000,
          security_deposit: 20000,
          available_months: 12,
          property_type: 'PG',
          gender_preference: 'girls',
          owner_name: 'Priya Sharma',
          owner_phone: '+91 87654 32109',
          payment_instructions: 'Remaining payment can be made through:\n1. Google Pay: priya@gpay\n2. PhonePe: 8765432109\n3. Cash on arrival\n\nPlease confirm payment method before check-in.',
          featured_image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          rating: 4.2,
          verified: true,
          instant_book: true,
          secure_booking: true,
          is_available: true
        }
      ];

      const { data: createdProperties, error: createError } = await supabase
        .from('properties')
        .insert(sampleProperties)
        .select();

      if (createError) {
        throw new Error('Failed to create properties: ' + createError.message);
      }

      results.push({
        action: 'created_properties',
        count: createdProperties?.length || 0,
        properties: createdProperties
      });
    } else {
      // Properties exist, check if they have owner details
      const propertiesWithoutOwner = existingProperties.filter(p => !p.owner_name);
      
      if (propertiesWithoutOwner.length > 0) {
        console.log('📝 Adding owner details to existing properties...');
        
        const ownerDetailsData = [
          {
            owner_name: 'Rajesh Kumar',
            owner_phone: '+91 98765 43210',
            payment_instructions: 'Please pay the remaining amount via UPI: rajesh@paytm or Bank Transfer:\nAccount No: 1234567890\nIFSC: SBIN0001234\nAccount Name: Rajesh Kumar'
          },
          {
            owner_name: 'Priya Sharma',
            owner_phone: '+91 87654 32109',
            payment_instructions: 'Remaining payment can be made through:\n1. Google Pay: priya@gpay\n2. PhonePe: 8765432109\n3. Cash on arrival\n\nPlease confirm payment method before check-in.'
          },
          {
            owner_name: 'Amit Patel',
            owner_phone: '+91 76543 21098',
            payment_instructions: 'Payment Options for Remaining Amount:\n• UPI: amit.patel@okaxis\n• NEFT/RTGS: Account Details will be shared\n• Paytm: 7654321098\n\nKindly share payment screenshot for confirmation.'
          }
        ];

        for (let i = 0; i < Math.min(propertiesWithoutOwner.length, ownerDetailsData.length); i++) {
          const property = propertiesWithoutOwner[i];
          const ownerData = ownerDetailsData[i];

          const { error: updateError } = await supabase
            .from('properties')
            .update(ownerData)
            .eq('id', property.id);

          if (!updateError) {
            results.push({
              action: 'updated_owner_details',
              property_id: property.id,
              property_name: property.name
            });
          }
        }
      }

      results.push({
        action: 'properties_exist',
        count: existingProperties.length,
        with_owner_details: existingProperties.filter(p => p.owner_name).length
      });
    }

    // Get final property list
    const { data: finalProperties } = await supabase
      .from('properties')
      .select('id, name, owner_name, owner_phone')
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Test data ensured successfully',
      results,
      anchored_properties: finalProperties
    });

  } catch (error: any) {
    console.error('❌ Test data setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}