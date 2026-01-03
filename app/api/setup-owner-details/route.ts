import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Setting up owner details for existing properties...');

    // First, get the actual property IDs from the database
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, name')
      .limit(3);

    if (fetchError) {
      throw new Error('Failed to fetch properties: ' + fetchError.message);
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No properties found in database'
      });
    }

    // Update existing properties with sample owner details
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

    const results = [];

    for (let i = 0; i < Math.min(properties.length, ownerDetailsData.length); i++) {
      const property = properties[i];
      const ownerData = ownerDetailsData[i];

      const { data, error } = await supabase
        .from('properties')
        .update({
          owner_name: ownerData.owner_name,
          owner_phone: ownerData.owner_phone,
          payment_instructions: ownerData.payment_instructions
        })
        .eq('id', property.id)
        .select();

      results.push({
        id: property.id,
        name: property.name,
        success: !error,
        error: error?.message,
        data
      });

      if (error) {
        console.error(`❌ Failed to update property ${property.id}:`, error);
      } else {
        console.log(`✅ Updated property ${property.id} (${property.name}) with owner details`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Owner details setup completed',
      results
    });

  } catch (error: any) {
    console.error('❌ Owner details setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if owner details columns exist by trying to select them
    const { data, error } = await supabase
      .from('properties')
      .select('id, name, owner_name, owner_phone, payment_instructions')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Owner details columns not found in database',
        message: 'Please add the owner details columns to the properties table',
        sqlCommand: `
ALTER TABLE properties 
ADD COLUMN owner_name TEXT,
ADD COLUMN owner_phone TEXT,
ADD COLUMN payment_instructions TEXT;
        `.trim()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Owner details columns exist',
      sampleData: data
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}