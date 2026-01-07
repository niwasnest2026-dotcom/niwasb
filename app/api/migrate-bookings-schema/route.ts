import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting bookings schema migration...');

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

    const migrations = [];
    const errors = [];

    // Define the complete bookings table schema according to our types
    const requiredColumns = [
      { name: 'id', type: 'UUID', default: 'gen_random_uuid()', nullable: false, primary: true },
      { name: 'property_id', type: 'UUID', nullable: false, references: 'properties(id)' },
      { name: 'room_id', type: 'UUID', nullable: true, references: 'property_rooms(id)' },
      { name: 'user_id', type: 'UUID', nullable: true, references: 'auth.users(id)' },
      { name: 'guest_name', type: 'TEXT', nullable: false },
      { name: 'guest_email', type: 'TEXT', nullable: false },
      { name: 'guest_phone', type: 'TEXT', nullable: false },
      { name: 'sharing_type', type: 'TEXT', nullable: false },
      { name: 'price_per_person', type: 'NUMERIC', nullable: false },
      { name: 'security_deposit_per_person', type: 'NUMERIC', nullable: false },
      { name: 'total_amount', type: 'NUMERIC', nullable: false },
      { name: 'amount_paid', type: 'NUMERIC', nullable: false },
      { name: 'amount_due', type: 'NUMERIC', nullable: false },
      { name: 'payment_method', type: 'TEXT', nullable: false },
      { name: 'payment_status', type: 'TEXT', nullable: true },
      { name: 'booking_status', type: 'TEXT', nullable: true },
      { name: 'check_in_date', type: 'TIMESTAMPTZ', nullable: true },
      { name: 'check_out_date', type: 'TIMESTAMPTZ', nullable: true },
      { name: 'booking_date', type: 'TIMESTAMPTZ', nullable: true },
      { name: 'payment_date', type: 'TIMESTAMPTZ', nullable: true },
      { name: 'payment_id', type: 'TEXT', nullable: true }, // This is the critical field
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()', nullable: true },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()', nullable: true }
    ];

    // Step 1: Check if bookings table exists
    console.log('📋 Checking if bookings table exists...');
    const { data: tableExists, error: tableCheckError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'bookings')
      .single();

    if (tableCheckError && tableCheckError.code !== 'PGRST116') {
      errors.push(`Failed to check table existence: ${tableCheckError.message}`);
      return NextResponse.json({
        success: false,
        error: 'Failed to check table existence',
        details: tableCheckError
      }, { status: 500 });
    }

    if (!tableExists) {
      // Create the entire table
      console.log('🏗️ Creating bookings table...');
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.bookings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          property_id UUID NOT NULL REFERENCES public.properties(id),
          room_id UUID REFERENCES public.property_rooms(id),
          user_id UUID REFERENCES auth.users(id),
          guest_name TEXT NOT NULL,
          guest_email TEXT NOT NULL,
          guest_phone TEXT NOT NULL,
          sharing_type TEXT NOT NULL,
          price_per_person NUMERIC NOT NULL,
          security_deposit_per_person NUMERIC NOT NULL,
          total_amount NUMERIC NOT NULL,
          amount_paid NUMERIC NOT NULL,
          amount_due NUMERIC NOT NULL,
          payment_method TEXT NOT NULL,
          payment_status TEXT,
          booking_status TEXT,
          check_in_date TIMESTAMPTZ,
          check_out_date TIMESTAMPTZ,
          booking_date TIMESTAMPTZ,
          payment_date TIMESTAMPTZ,
          payment_id TEXT,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      try {
        // Use raw SQL execution
        const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
          sql: createTableSQL
        });

        if (createError) {
          errors.push(`Failed to create table: ${createError.message}`);
        } else {
          migrations.push('✅ Created bookings table with complete schema');
        }
      } catch (error: any) {
        errors.push(`Table creation failed: ${error.message}`);
      }
    } else {
      migrations.push('✅ Bookings table already exists');

      // Step 2: Check existing columns
      console.log('🔍 Checking existing columns...');
      const { data: existingColumns, error: columnsError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'bookings')
        .eq('table_schema', 'public');

      if (columnsError) {
        errors.push(`Failed to get columns: ${columnsError.message}`);
      } else {
        const existingColumnNames = existingColumns?.map(col => col.column_name) || [];
        
        // Step 3: Add missing columns
        for (const requiredCol of requiredColumns) {
          if (!existingColumnNames.includes(requiredCol.name)) {
            console.log(`➕ Adding missing column: ${requiredCol.name}`);
            
            let alterSQL = `ALTER TABLE public.bookings ADD COLUMN ${requiredCol.name} ${requiredCol.type}`;
            
            if (!requiredCol.nullable) {
              if (requiredCol.default) {
                alterSQL += ` DEFAULT ${requiredCol.default} NOT NULL`;
              } else {
                // For non-nullable columns without defaults, we need to add a default first
                if (requiredCol.type === 'TEXT') {
                  alterSQL += ` DEFAULT '' NOT NULL`;
                } else if (requiredCol.type === 'NUMERIC') {
                  alterSQL += ` DEFAULT 0 NOT NULL`;
                } else if (requiredCol.type === 'UUID') {
                  alterSQL += ` DEFAULT gen_random_uuid() NOT NULL`;
                } else {
                  alterSQL += ` NOT NULL`;
                }
              }
            } else {
              if (requiredCol.default) {
                alterSQL += ` DEFAULT ${requiredCol.default}`;
              }
            }

            try {
              const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
                sql: alterSQL
              });

              if (alterError) {
                errors.push(`Failed to add column ${requiredCol.name}: ${alterError.message}`);
              } else {
                migrations.push(`✅ Added column: ${requiredCol.name}`);
              }
            } catch (error: any) {
              errors.push(`Column addition failed for ${requiredCol.name}: ${error.message}`);
            }
          } else {
            migrations.push(`✅ Column exists: ${requiredCol.name}`);
          }
        }
      }
    }

    // Step 4: Create indexes for performance
    console.log('📊 Creating indexes...');
    const indexes = [
      { name: 'idx_bookings_payment_id', column: 'payment_id' },
      { name: 'idx_bookings_user_id', column: 'user_id' },
      { name: 'idx_bookings_property_id', column: 'property_id' },
      { name: 'idx_bookings_guest_email', column: 'guest_email' }
    ];

    for (const index of indexes) {
      try {
        const indexSQL = `CREATE INDEX IF NOT EXISTS ${index.name} ON public.bookings(${index.column})`;
        const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
          sql: indexSQL
        });

        if (indexError) {
          errors.push(`Failed to create index ${index.name}: ${indexError.message}`);
        } else {
          migrations.push(`✅ Created index: ${index.name}`);
        }
      } catch (error: any) {
        errors.push(`Index creation failed for ${index.name}: ${error.message}`);
      }
    }

    // Step 5: Test the schema
    console.log('🧪 Testing migrated schema...');
    try {
      const { data: schemaTest, error: testError } = await supabaseAdmin
        .from('bookings')
        .select('id, payment_id, property_id, guest_name')
        .limit(1);

      if (testError) {
        errors.push(`Schema test failed: ${testError.message}`);
      } else {
        migrations.push('✅ Schema test passed');
      }
    } catch (error: any) {
      errors.push(`Schema test failed: ${error.message}`);
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'Schema migration completed successfully' : 'Schema migration completed with issues',
      migrations: migrations,
      errors: errors,
      summary: {
        total_migrations: migrations.length,
        errors_count: errors.length,
        schema_status: errors.length === 0 ? 'ready' : 'needs_review'
      }
    });

  } catch (error: any) {
    console.error('❌ Schema migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema migration failed: ' + error.message,
      details: error
    }, { status: 500 });
  }
}