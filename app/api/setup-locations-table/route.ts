import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
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

    console.log('🔧 Setting up locations table...');

    // Create locations table with proper schema
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,              -- "Whitefield"
        city TEXT NOT NULL,              -- "Bangalore"
        state TEXT,                      -- "Karnataka"
        latitude DOUBLE PRECISION,       -- GPS coordinates
        longitude DOUBLE PRECISION,      -- GPS coordinates
        popularity INTEGER DEFAULT 0,    -- number of PGs / searches
        property_count INTEGER DEFAULT 0, -- number of properties in this location
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: tableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTableQuery
    });

    if (tableError) {
      console.error('❌ Error creating locations table:', tableError);
      // Try alternative approach if RPC fails
      console.log('🔄 Trying alternative table creation...');
      
      // Create table using direct SQL (if RPC is not available)
      const { error: directError } = await supabaseAdmin
        .from('locations')
        .select('id')
        .limit(1);

      if (directError && directError.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Locations table needs to be created manually in Supabase dashboard',
          sql: createTableQuery,
          instructions: [
            '1. Go to Supabase Dashboard > SQL Editor',
            '2. Run the provided SQL query',
            '3. Create the indexes as shown',
            '4. Run this API again to populate data'
          ]
        });
      }
    }

    console.log('✅ Locations table created/verified');

    // Create indexes for better performance
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_location_name ON locations USING gin (name gin_trgm_ops);`,
      `CREATE INDEX IF NOT EXISTS idx_location_city ON locations(city);`,
      `CREATE INDEX IF NOT EXISTS idx_location_state ON locations(state);`,
      `CREATE INDEX IF NOT EXISTS idx_location_popularity ON locations(popularity DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_location_coords ON locations(latitude, longitude);`
    ];

    for (const indexQuery of indexQueries) {
      try {
        const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
          sql: indexQuery
        });
        if (indexError) {
          console.warn('⚠️ Index creation warning:', indexError.message);
        }
      } catch (err) {
        console.warn('⚠️ Could not create index, may need manual creation');
      }
    }

    console.log('✅ Indexes created/verified');

    // Populate with existing property locations
    await populateLocationsFromProperties(supabaseAdmin);

    // Add popular static locations
    await addPopularLocations(supabaseAdmin);

    return NextResponse.json({
      success: true,
      message: 'Locations table setup completed',
      table_created: true,
      indexes_created: true,
      data_populated: true
    });

  } catch (error: any) {
    console.error('❌ Error setting up locations table:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      sql_needed: `
        CREATE TABLE IF NOT EXISTS locations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          popularity INTEGER DEFAULT 0,
          property_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_location_name ON locations USING gin (name gin_trgm_ops);
        CREATE INDEX IF NOT EXISTS idx_location_city ON locations(city);
        CREATE INDEX IF NOT EXISTS idx_location_state ON locations(state);
        CREATE INDEX IF NOT EXISTS idx_location_popularity ON locations(popularity DESC);
        CREATE INDEX IF NOT EXISTS idx_location_coords ON locations(latitude, longitude);
      `
    }, { status: 500 });
  }
}

async function populateLocationsFromProperties(supabaseAdmin: any) {
  try {
    console.log('🔄 Populating locations from existing properties...');

    // Get all unique locations from properties
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('city, area, address, latitude, longitude')
      .not('city', 'is', null);

    if (error) throw error;

    const locationMap = new Map();

    properties?.forEach((property: any) => {
      if (property.city?.trim()) {
        const cityKey = property.city.trim().toLowerCase();
        if (!locationMap.has(cityKey)) {
          locationMap.set(cityKey, {
            name: property.city.trim(),
            city: property.city.trim(),
            state: extractState(property.city),
            latitude: property.latitude || null,
            longitude: property.longitude || null,
            property_count: 1,
            popularity: 1
          });
        } else {
          const existing = locationMap.get(cityKey);
          existing.property_count += 1;
          existing.popularity += 1;
        }
      }

      if (property.area?.trim() && property.city?.trim()) {
        const areaKey = `${property.area.trim()}, ${property.city.trim()}`.toLowerCase();
        if (!locationMap.has(areaKey)) {
          locationMap.set(areaKey, {
            name: property.area.trim(),
            city: property.city.trim(),
            state: extractState(property.city),
            latitude: property.latitude || null,
            longitude: property.longitude || null,
            property_count: 1,
            popularity: 2 // Areas are more specific, higher popularity
          });
        } else {
          const existing = locationMap.get(areaKey);
          existing.property_count += 1;
          existing.popularity += 2;
        }
      }
    });

    // Insert locations
    const locationsToInsert = Array.from(locationMap.values());
    
    if (locationsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('locations')
        .upsert(locationsToInsert, { 
          onConflict: 'name,city',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.warn('⚠️ Some locations may not have been inserted:', insertError.message);
      } else {
        console.log(`✅ Inserted ${locationsToInsert.length} locations from properties`);
      }
    }

  } catch (error) {
    console.error('❌ Error populating locations from properties:', error);
  }
}

async function addPopularLocations(supabaseAdmin: any) {
  try {
    console.log('🔄 Adding popular static locations...');

    const popularLocations = [
      // Bangalore
      { name: 'Koramangala', city: 'Bangalore', state: 'Karnataka', popularity: 100 },
      { name: 'HSR Layout', city: 'Bangalore', state: 'Karnataka', popularity: 95 },
      { name: 'BTM Layout', city: 'Bangalore', state: 'Karnataka', popularity: 90 },
      { name: 'Electronic City', city: 'Bangalore', state: 'Karnataka', popularity: 85 },
      { name: 'Whitefield', city: 'Bangalore', state: 'Karnataka', popularity: 80 },
      { name: 'Marathahalli', city: 'Bangalore', state: 'Karnataka', popularity: 75 },
      { name: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', popularity: 70 },
      
      // Mumbai
      { name: 'Andheri', city: 'Mumbai', state: 'Maharashtra', popularity: 100 },
      { name: 'Bandra', city: 'Mumbai', state: 'Maharashtra', popularity: 95 },
      { name: 'Powai', city: 'Mumbai', state: 'Maharashtra', popularity: 90 },
      { name: 'Thane', city: 'Mumbai', state: 'Maharashtra', popularity: 85 },
      
      // Delhi
      { name: 'Lajpat Nagar', city: 'Delhi', state: 'Delhi', popularity: 90 },
      { name: 'Karol Bagh', city: 'Delhi', state: 'Delhi', popularity: 85 },
      { name: 'Rajouri Garden', city: 'Delhi', state: 'Delhi', popularity: 80 },
      
      // Pune
      { name: 'Kothrud', city: 'Pune', state: 'Maharashtra', popularity: 85 },
      { name: 'Aundh', city: 'Pune', state: 'Maharashtra', popularity: 80 },
      { name: 'Baner', city: 'Pune', state: 'Maharashtra', popularity: 75 },
      
      // Hyderabad
      { name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', popularity: 90 },
      { name: 'Madhapur', city: 'Hyderabad', state: 'Telangana', popularity: 85 },
      { name: 'Kondapur', city: 'Hyderabad', state: 'Telangana', popularity: 80 },
      
      // Chennai
      { name: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', popularity: 85 },
      { name: 'T Nagar', city: 'Chennai', state: 'Tamil Nadu', popularity: 80 },
      { name: 'Velachery', city: 'Chennai', state: 'Tamil Nadu', popularity: 75 }
    ];

    const { error: insertError } = await supabaseAdmin
      .from('locations')
      .upsert(popularLocations, { 
        onConflict: 'name,city',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.warn('⚠️ Some popular locations may not have been inserted:', insertError.message);
    } else {
      console.log(`✅ Added ${popularLocations.length} popular locations`);
    }

  } catch (error) {
    console.error('❌ Error adding popular locations:', error);
  }
}

function extractState(city: string): string {
  const stateMap: { [key: string]: string } = {
    'bangalore': 'Karnataka',
    'mumbai': 'Maharashtra',
    'delhi': 'Delhi',
    'pune': 'Maharashtra',
    'hyderabad': 'Telangana',
    'chennai': 'Tamil Nadu',
    'kolkata': 'West Bengal',
    'ahmedabad': 'Gujarat',
    'jaipur': 'Rajasthan',
    'lucknow': 'Uttar Pradesh'
  };

  return stateMap[city.toLowerCase()] || '';
}

export async function GET() {
  try {
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

    // Check if locations table exists and get sample data
    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({
        success: false,
        table_exists: false,
        error: error.message,
        setup_needed: true
      });
    }

    return NextResponse.json({
      success: true,
      table_exists: true,
      sample_locations: locations,
      total_count: locations?.length || 0
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}