import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check total properties count
    const { data: allProperties, error: allError } = await supabase
      .from('properties')
      .select('id, name')
      .order('created_at', { ascending: false });

    if (allError) throw allError;

    // Try to check available properties (if is_available column exists)
    let availableProperties = allProperties;
    let hasIsAvailableColumn = true;
    
    try {
      const { data: availableData, error: availableError } = await supabase
        .from('properties')
        .select('id, name, is_available')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (!availableError) {
        availableProperties = availableData;
      } else {
        throw availableError;
      }
    } catch (availableErr) {
      // is_available column doesn't exist
      hasIsAvailableColumn = false;
      availableProperties = allProperties;
    }

    return NextResponse.json({
      success: true,
      total: allProperties?.length || 0,
      available: availableProperties?.length || 0,
      hasIsAvailableColumn,
      properties: allProperties || [],
      availableProperties: availableProperties || [],
      note: hasIsAvailableColumn ? 'Using is_available column filter' : 'is_available column not found, showing all properties'
    });

  } catch (error: any) {
    console.error('Error checking properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        total: 0,
        available: 0
      },
      { status: 500 }
    );
  }
}