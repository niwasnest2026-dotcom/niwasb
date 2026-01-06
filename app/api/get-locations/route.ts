import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create admin client to fetch all locations
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

    // Get all unique locations from properties
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('city, area, address')
      .eq('is_available', true)
      .not('city', 'is', null)
      .not('area', 'is', null);

    if (error) {
      console.error('Error fetching locations:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Process and create unique location suggestions
    const locationSet = new Set<string>();
    
    properties?.forEach(property => {
      // Add city
      if (property.city?.trim()) {
        locationSet.add(property.city.trim());
      }
      
      // Add area with city
      if (property.area?.trim() && property.city?.trim()) {
        locationSet.add(`${property.area.trim()}, ${property.city.trim()}`);
      }
      
      // Add area alone if no city
      if (property.area?.trim() && !property.city?.trim()) {
        locationSet.add(property.area.trim());
      }
      
      // Extract area from address if available
      if (property.address?.trim()) {
        const addressParts = property.address.split(',');
        if (addressParts.length > 1) {
          const area = addressParts[0].trim();
          const city = property.city?.trim() || addressParts[addressParts.length - 1]?.trim();
          if (area && city) {
            locationSet.add(`${area}, ${city}`);
          }
        }
      }
    });

    // Convert to array and sort
    const dynamicLocations = Array.from(locationSet)
      .filter(location => location.length > 2) // Filter out very short names
      .sort((a, b) => a.localeCompare(b));

    // Popular static locations (fallback)
    const staticLocations = [
      // Bangalore
      'Koramangala, Bangalore', 'HSR Layout, Bangalore', 'BTM Layout, Bangalore', 
      'Electronic City, Bangalore', 'Whitefield, Bangalore', 'Marathahalli, Bangalore',
      'Indiranagar, Bangalore', 'Jayanagar, Bangalore', 'JP Nagar, Bangalore',
      'Christ University, Bangalore', 'PES University, Bangalore', 'RV College, Bangalore',
      'Infosys, Electronic City', 'TCS, Whitefield', 'Wipro, Sarjapur',
      
      // Mumbai
      'Andheri, Mumbai', 'Bandra, Mumbai', 'Powai, Mumbai', 'Thane, Mumbai',
      'Goregaon, Mumbai', 'Malad, Mumbai', 'Kandivali, Mumbai', 'Borivali, Mumbai',
      'IIT Bombay, Mumbai', 'NMIMS, Mumbai', 'DJ Sanghvi, Mumbai',
      'BKC, Mumbai', 'Lower Parel, Mumbai', 'Navi Mumbai',
      
      // Delhi
      'Lajpat Nagar, Delhi', 'Karol Bagh, Delhi', 'Rajouri Garden, Delhi',
      'Dwarka, Delhi', 'Rohini, Delhi', 'Pitampura, Delhi',
      'DU North Campus, Delhi', 'DU South Campus, Delhi', 'JNU, Delhi',
      'Connaught Place, Delhi', 'Gurgaon', 'Noida',
      
      // Pune
      'Kothrud, Pune', 'Aundh, Pune', 'Baner, Pune', 'Wakad, Pune',
      'Hinjewadi, Pune', 'Viman Nagar, Pune', 'Koregaon Park, Pune',
      'Pune University', 'VIT Pune', 'Symbiosis, Pune',
      
      // Hyderabad
      'Gachibowli, Hyderabad', 'Madhapur, Hyderabad', 'Kondapur, Hyderabad',
      'Kukatpally, Hyderabad', 'Ameerpet, Hyderabad', 'Begumpet, Hyderabad',
      'HITEC City, Hyderabad', 'ISB Hyderabad', 'IIIT Hyderabad',
      
      // Chennai
      'Anna Nagar, Chennai', 'T Nagar, Chennai', 'Velachery, Chennai',
      'OMR, Chennai', 'Adyar, Chennai', 'Guindy, Chennai',
      'IIT Madras, Chennai', 'Anna University, Chennai', 'SRM University, Chennai'
    ];

    // Combine dynamic and static locations, prioritizing dynamic ones
    const allLocations = [
      ...dynamicLocations,
      ...staticLocations.filter(staticLoc => 
        !dynamicLocations.some(dynamicLoc => 
          dynamicLoc.toLowerCase().includes(staticLoc.toLowerCase()) ||
          staticLoc.toLowerCase().includes(dynamicLoc.toLowerCase())
        )
      )
    ];

    return NextResponse.json({
      success: true,
      locations: allLocations,
      dynamic_count: dynamicLocations.length,
      static_count: staticLocations.length,
      total_count: allLocations.length
    });

  } catch (error: any) {
    console.error('Error in get-locations API:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}