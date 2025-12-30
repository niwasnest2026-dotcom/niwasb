import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check total properties count
    const { data: allProperties, error: allError } = await supabase
      .from('properties')
      .select('id, name, is_available')
      .order('created_at', { ascending: false });

    if (allError) throw allError;

    // Check available properties count
    const { data: availableProperties, error: availableError } = await supabase
      .from('properties')
      .select('id, name, is_available')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (availableError) throw availableError;

    return NextResponse.json({
      success: true,
      total: allProperties?.length || 0,
      available: availableProperties?.length || 0,
      properties: allProperties || [],
      availableProperties: availableProperties || []
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