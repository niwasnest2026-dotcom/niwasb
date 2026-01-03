import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔄 Syncing missing profiles...');

    // This API requires service role key to work properly
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY is required for this operation',
        instructions: [
          '1. Go to your Supabase Dashboard',
          '2. Navigate to Settings > API',
          '3. Copy the service_role key (not the anon key)',
          '4. Add it to your .env file as SUPABASE_SERVICE_ROLE_KEY=your_key_here',
          '5. Restart your development server'
        ]
      }, { status: 400 });
    }

    // Import admin client here to avoid errors when service key is missing
    const { supabaseAdmin } = await import('@/lib/supabase-admin');

    // Get all auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Failed to fetch auth users: ${authError.message}`);
    }

    const authUsers = authData.users || [];
    console.log(`Found ${authUsers.length} auth users`);

    // Get existing profiles
    const { data: existingProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email');

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
    console.log(`Found ${existingProfiles?.length || 0} existing profiles`);

    // Find users without profiles
    const usersWithoutProfiles = authUsers.filter(user => !existingProfileIds.has(user.id));
    console.log(`Found ${usersWithoutProfiles.length} users without profiles`);

    if (usersWithoutProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All users already have profiles',
        stats: {
          total_auth_users: authUsers.length,
          existing_profiles: existingProfiles?.length || 0,
          created_profiles: 0
        }
      });
    }

    // Create missing profiles
    const profilesToCreate = usersWithoutProfiles.map(user => ({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data: createdProfiles, error: createError } = await supabaseAdmin
      .from('profiles')
      .insert(profilesToCreate)
      .select();

    if (createError) {
      throw new Error(`Failed to create profiles: ${createError.message}`);
    }

    console.log(`Successfully created ${createdProfiles?.length || 0} profiles`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${createdProfiles?.length || 0} missing profiles`,
      stats: {
        total_auth_users: authUsers.length,
        existing_profiles: existingProfiles?.length || 0,
        created_profiles: createdProfiles?.length || 0
      },
      created_profiles: createdProfiles?.map(p => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name
      })) || []
    });

  } catch (error: any) {
    console.error('❌ Sync profiles error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}