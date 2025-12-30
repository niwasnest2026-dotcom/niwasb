import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Starting database fix...');

    // First, check if is_available column exists
    const { data: testData, error: testError } = await supabase
      .from('properties')
      .select('is_available')
      .limit(1);

    if (!testError) {
      return NextResponse.json({
        success: true,
        message: 'Database is already correct - is_available column exists',
        action: 'none'
      });
    }

    console.log('❌ is_available column missing');

    // Since we can't automatically add the column, return manual instructions
    return NextResponse.json({
      success: false,
      error: 'is_available column does not exist',
      message: 'Please add the is_available column manually in Supabase dashboard',
      instructions: [
        '1. Go to your Supabase dashboard (https://supabase.com/dashboard)',
        '2. Navigate to Table Editor > properties',
        '3. Click "Add Column"',
        '4. Name: is_available, Type: boolean, Default: true',
        '5. Save the column',
        '6. Refresh your application'
      ],
      sqlCommand: 'ALTER TABLE properties ADD COLUMN is_available BOOLEAN DEFAULT true;',
      dashboardUrl: 'https://supabase.com/dashboard'
    });

  } catch (error: any) {
    console.error('💥 Database fix failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Database check failed - manual intervention required',
        instructions: [
          '1. Go to your Supabase dashboard (https://supabase.com/dashboard)',
          '2. Navigate to Table Editor > properties',
          '3. Click "Add Column"',
          '4. Name: is_available, Type: boolean, Default: true',
          '5. Save the column'
        ]
      },
      { status: 500 }
    );
  }
}