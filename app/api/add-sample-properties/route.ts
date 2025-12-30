import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if properties already exist
    const { data: existingProperties, error: checkError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    if (existingProperties && existingProperties.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Properties already exist',
        count: existingProperties.length
      });
    }

    // Sample properties data
    const sampleProperties = [
      {
        name: 'Sunrise PG for Students',
        description: 'Modern PG accommodation perfect for students and working professionals. Fully furnished rooms with all amenities.',
        address: 'MG Road, Near Metro Station',
        city: 'Bangalore',
        area: 'MG Road',
        price: 12000,
        security_deposit: 24000,
        available_months: 12,
        property_type: 'PG',
        gender_preference: 'boys',
        featured_image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
        rating: 4.5,
        verified: true,
        instant_book: true,
        secure_booking: true
      },
      {
        name: 'Green Valley PG',
        description: 'Comfortable and affordable PG with excellent facilities. Located in prime area with easy transport access.',
        address: 'Koramangala 5th Block',
        city: 'Bangalore',
        area: 'Koramangala',
        price: 10000,
        security_deposit: 20000,
        available_months: 12,
        property_type: 'PG',
        gender_preference: 'girls',
        featured_image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        rating: 4.2,
        verified: true,
        instant_book: true,
        secure_booking: true
      },
      {
        name: 'Elite Residency',
        description: 'Premium PG accommodation with luxury amenities. Perfect for professionals seeking comfort and convenience.',
        address: 'Brigade Road, Central Bangalore',
        city: 'Bangalore',
        area: 'Brigade Road',
        price: 15000,
        security_deposit: 30000,
        available_months: 6,
        property_type: 'Flat',
        gender_preference: 'any',
        featured_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        rating: 4.8,
        verified: true,
        instant_book: true,
        secure_booking: true
      }
    ];

    // Insert sample properties
    const { data: insertedProperties, error: insertError } = await supabase
      .from('properties')
      .insert(sampleProperties as any)
      .select();

    if (insertError) throw insertError;

    // Add sample rooms for each property
    const sampleRooms: any[] = [];
    for (const property of insertedProperties || []) {
      // Add different room types for each property
      sampleRooms.push(
        {
          property_id: (property as any).id,
          room_number: 'R101',
          sharing_type: 'Single Room',
          price_per_person: (property as any).price,
          security_deposit_per_person: (property as any).security_deposit,
          total_beds: 1,
          available_beds: 1
        },
        {
          property_id: (property as any).id,
          room_number: 'R102',
          sharing_type: 'Double Sharing',
          price_per_person: Math.round((property as any).price * 0.8),
          security_deposit_per_person: Math.round((property as any).security_deposit * 0.8),
          total_beds: 2,
          available_beds: 2
        },
        {
          property_id: (property as any).id,
          room_number: 'R103',
          sharing_type: 'Triple Sharing',
          price_per_person: Math.round((property as any).price * 0.6),
          security_deposit_per_person: Math.round((property as any).security_deposit * 0.6),
          total_beds: 3,
          available_beds: 3
        }
      );
    }

    const { error: roomsError } = await supabase
      .from('property_rooms')
      .insert(sampleRooms as any);

    if (roomsError) throw roomsError;

    // Add multiple images for each property
    const sampleImages: any[] = [];
    for (let i = 0; i < (insertedProperties?.length || 0); i++) {
      const property = insertedProperties![i];
      const propertyImages = [
        {
          property_id: (property as any).id,
          image_url: i === 0 
            ? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop'
            : i === 1 
              ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'
              : 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
          display_order: 1
        },
        {
          property_id: (property as any).id,
          image_url: i === 0 
            ? 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
            : i === 1 
              ? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
              : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
          display_order: 2
        },
        {
          property_id: (property as any).id,
          image_url: i === 0 
            ? 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
            : i === 1 
              ? 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
              : 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&h=600&fit=crop',
          display_order: 3
        },
        {
          property_id: (property as any).id,
          image_url: i === 0 
            ? 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'
            : i === 1 
              ? 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop'
              : 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop',
          display_order: 4
        }
      ];
      sampleImages.push(...propertyImages);
    }

    const { error: imagesError } = await supabase
      .from('property_images')
      .insert(sampleImages as any);

    if (imagesError) throw imagesError;

    return NextResponse.json({
      success: true,
      message: 'Sample properties, rooms, and images added successfully',
      propertiesAdded: insertedProperties?.length || 0,
      roomsAdded: sampleRooms.length,
      imagesAdded: sampleImages.length
    });

  } catch (error: any) {
    console.error('Error adding sample properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}