import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

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

    console.log('🔍 Searching locations for:', query);

    // Try to search in dedicated locations table first
    const { data: locationsTable, error: locationsError } = await supabaseAdmin
      .from('locations')
      .select('name, city, state, popularity, property_count, latitude, longitude')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .order('popularity', { ascending: false })
      .limit(limit);

    if (!locationsError && locationsTable && locationsTable.length > 0) {
      console.log('📍 Found locations in dedicated table:', locationsTable.length);
      
      // Format results with proper structure
      const formattedResults = locationsTable.map(location => ({
        id: `${location.name}_${location.city}`,
        name: location.name,
        city: location.city,
        state: location.state,
        display_name: location.name === location.city ? 
          location.city : 
          `${location.name}, ${location.city}`,
        popularity: location.popularity,
        property_count: location.property_count,
        coordinates: location.latitude && location.longitude ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        source: 'locations_table'
      }));

      return NextResponse.json({
        success: true,
        results: formattedResults,
        count: formattedResults.length,
        query: query,
        source: 'locations_table',
        performance: 'optimized'
      });
    }

    console.log('📍 Falling back to properties search');

    // Fallback: Search in properties table
    const { data: properties, error: propertiesError } = await supabaseAdmin
      .from('properties')
      .select('id, name, city, area, address, latitude, longitude')
      .or(`city.ilike.%${query}%,area.ilike.%${query}%,address.ilike.%${query}%,name.ilike.%${query}%`)
      .eq('is_available', true)
      .limit(limit);

    if (propertiesError) {
      throw propertiesError;
    }

    // Process properties into location suggestions
    const locationMap = new Map();

    properties?.forEach(property => {
      // Add city-based location
      if (property.city?.trim()) {
        const cityKey = property.city.trim().toLowerCase();
        if (!locationMap.has(cityKey)) {
          locationMap.set(cityKey, {
            id: `city_${property.city.trim()}`,
            name: property.city.trim(),
            city: property.city.trim(),
            state: '',
            display_name: property.city.trim(),
            popularity: 1,
            property_count: 1,
            coordinates: property.latitude && property.longitude ? {
              lat: property.latitude,
              lng: property.longitude
            } : null,
            source: 'properties_extraction'
          });
        } else {
          const existing = locationMap.get(cityKey);
          existing.property_count += 1;
          existing.popularity += 1;
        }
      }

      // Add area-based location
      if (property.area?.trim() && property.city?.trim()) {
        const areaKey = `${property.area.trim()}_${property.city.trim()}`.toLowerCase();
        if (!locationMap.has(areaKey)) {
          locationMap.set(areaKey, {
            id: `area_${property.area.trim()}_${property.city.trim()}`,
            name: property.area.trim(),
            city: property.city.trim(),
            state: '',
            display_name: `${property.area.trim()}, ${property.city.trim()}`,
            popularity: 2,
            property_count: 1,
            coordinates: property.latitude && property.longitude ? {
              lat: property.latitude,
              lng: property.longitude
            } : null,
            source: 'properties_extraction'
          });
        } else {
          const existing = locationMap.get(areaKey);
          existing.property_count += 1;
          existing.popularity += 2;
        }
      }
    });

    const results = Array.from(locationMap.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      results: results,
      count: results.length,
      query: query,
      source: 'properties_extraction',
      performance: 'fallback',
      suggestion: 'Setup locations table for better search performance'
    });

  } catch (error: any) {
    console.error('❌ Error searching locations:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      query: request.url
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Update location popularity when searched/selected
    const { location_name, city, action = 'search' } = await request.json();

    if (!location_name || !city) {
      return NextResponse.json({
        success: false,
        error: 'Location name and city are required'
      }, { status: 400 });
    }

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

    // Try to update popularity in locations table
    const { data: location, error: findError } = await supabaseAdmin
      .from('locations')
      .select('id, popularity')
      .eq('name', location_name)
      .eq('city', city)
      .single();

    if (!findError && location) {
      // Update existing location popularity
      const increment = action === 'select' ? 2 : 1; // Selections are worth more than searches
      
      const { error: updateError } = await supabaseAdmin
        .from('locations')
        .update({
          popularity: location.popularity + increment,
          updated_at: new Date().toISOString()
        })
        .eq('id', location.id);

      if (updateError) {
        console.error('❌ Error updating location popularity:', updateError);
      } else {
        console.log(`✅ Updated popularity for ${location_name}, ${city}`);
      }
    } else {
      // Location doesn't exist in table, could create it
      console.log(`⚠️ Location not found in table: ${location_name}, ${city}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Location popularity updated',
      action: action,
      location: `${location_name}, ${city}`
    });

  } catch (error: any) {
    console.error('❌ Error updating location popularity:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}