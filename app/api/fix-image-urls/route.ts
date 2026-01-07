import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ Starting image URL fix...');

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

    // Default fallback image
    const defaultImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

    // Function to validate image URL
    const isValidImageUrl = (url: string): boolean => {
      if (!url) return false;
      
      // Check for invalid patterns
      const invalidPatterns = [
        'data:image/jpeg;bas', // Incomplete data URLs
        'freepik.com', // Freepik URLs don't work as direct images
        'drive.google.com', // Google Drive links don't work as direct images
        '/placeholder.jpg' // Local placeholder that doesn't exist
      ];

      return !invalidPatterns.some(pattern => url.includes(pattern));
    };

    // Fix properties with invalid featured images
    console.log('🔍 Checking properties with invalid images...');
    const { data: properties, error: propertiesError } = await supabaseAdmin
      .from('properties')
      .select('id, name, featured_image');

    if (propertiesError) {
      errors.push(`Failed to fetch properties: ${propertiesError.message}`);
    } else if (properties) {
      for (const property of properties) {
        if (!isValidImageUrl(property.featured_image)) {
          console.log(`🔧 Fixing image for property: ${property.name}`);
          
          const { error: updateError } = await supabaseAdmin
            .from('properties')
            .update({ featured_image: defaultImage })
            .eq('id', property.id);

          if (updateError) {
            errors.push(`Failed to update property ${property.name}: ${updateError.message}`);
          } else {
            fixes.push(`Fixed image for property: ${property.name}`);
          }
        }
      }
    }

    // Fix property images table
    console.log('🔍 Checking property_images table...');
    const { data: propertyImages, error: imagesError } = await supabaseAdmin
      .from('property_images')
      .select('id, property_id, image_url');

    if (imagesError) {
      errors.push(`Failed to fetch property images: ${imagesError.message}`);
    } else if (propertyImages) {
      for (const image of propertyImages) {
        if (!isValidImageUrl(image.image_url)) {
          console.log(`🔧 Fixing property image: ${image.id}`);
          
          const { error: updateError } = await supabaseAdmin
            .from('property_images')
            .update({ image_url: defaultImage })
            .eq('id', image.id);

          if (updateError) {
            errors.push(`Failed to update property image ${image.id}: ${updateError.message}`);
          } else {
            fixes.push(`Fixed property image: ${image.id}`);
          }
        }
      }
    }

    // Add some valid sample images for properties that don't have any
    const sampleImages = [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2080&q=80'
    ];

    // Check for properties without featured images
    const { data: propertiesWithoutImages, error: noImageError } = await supabaseAdmin
      .from('properties')
      .select('id, name, featured_image')
      .or('featured_image.is.null,featured_image.eq.');

    if (!noImageError && propertiesWithoutImages) {
      for (let i = 0; i < propertiesWithoutImages.length; i++) {
        const property = propertiesWithoutImages[i];
        const imageUrl = sampleImages[i % sampleImages.length];
        
        const { error: updateError } = await supabaseAdmin
          .from('properties')
          .update({ featured_image: imageUrl })
          .eq('id', property.id);

        if (updateError) {
          errors.push(`Failed to add image to property ${property.name}: ${updateError.message}`);
        } else {
          fixes.push(`Added image to property: ${property.name}`);
        }
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Image URL fix completed. ${fixes.length} fixes applied, ${errors.length} errors.`,
      fixes: fixes,
      errors: errors,
      summary: {
        fixes_applied: fixes.length,
        errors_found: errors.length,
        default_image_used: defaultImage
      }
    });

  } catch (error: any) {
    console.error('❌ Image URL fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Image URL fix failed: ' + error.message,
      details: error
    }, { status: 500 });
  }
}