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

    console.log('❌ is_available column missing, attempting to add it...');

    // Try to add the is_available column using SQL
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;'
    });

    if (alterError) {
      console.error('❌ Could not add column via RPC:', alterError);
      
      // Alternative: Update existing properties to have a default behavior
      // We'll just return instructions for manual fix
      return NextResponse.json({
        success: false,
        error: 'Cannot automatically add is_available column',
        message: 'Please add the is_available column manually in Supabase dashboard',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to Table Editor > properties',
          '3. Click "Add Column"',
          '4. Name: is_available, Type: boolean, Default: true',
          '5. Save the column',
          '6. Refresh your application'
        ],
        sqlCommand: 'ALTER TABLE properties ADD COLUMN is_available BOOLEAN DEFAULT true;'
      });
    }

    // If successful, update all existing properties to be available
    const { error: updateError } = await supabase
      .from('properties')
      .update({ is_available: true })
      .is('is_available', null);

    if (updateError) {
      console.error('❌ Could not update existing properties:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added is_available column and updated existing properties',
      action: 'added_column'
    });

  } catch (error: any) {
    console.error('💥 Database fix failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Database fix failed - manual intervention required',
        instructions: [
          '1. Go to your Supabase dashboard',
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