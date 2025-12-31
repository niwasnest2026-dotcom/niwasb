import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }

    console.log('🔧 Syncing profile for user:', user.email);
    console.log('🔧 User metadata:', user.user_metadata);

    // Extract data from user metadata (Google OAuth provides this)
    const userMetadata = user.user_metadata || {};
    const profileData = {
      id: user.id,
      email: user.email || '',
      full_name: userMetadata.full_name || userMetadata.name || '',
      phone: userMetadata.phone || '',
      phone_number: userMetadata.phone_number || '',
      avatar_url: userMetadata.avatar_url || userMetadata.picture || null,
      updated_at: new Date().toISOString()
    };

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message 
      }, { status: 500 });
    }

    let result;
    if (existingProfile) {
      // Update existing profile, but only if new data is available
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Only update fields that have new data and existing field is empty
      if (profileData.full_name && !existingProfile.full_name) {
        updateData.full_name = profileData.full_name;
      }
      if (profileData.avatar_url && !existingProfile.avatar_url) {
        updateData.avatar_url = profileData.avatar_url;
      }
      if (profileData.phone && !existingProfile.phone) {
        updateData.phone = profileData.phone;
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json({ 
          success: false, 
          error: updateError.message 
        }, { status: 500 });
      }

      result = updatedProfile;
      console.log('✅ Profile updated:', result);
    } else {
      // Create new profile
      const newProfileData = {
        ...profileData,
        created_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfileData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ 
          success: false, 
          error: createError.message 
        }, { status: 500 });
      }

      result = createdProfile;
      console.log('✅ Profile created:', result);
    }

    return NextResponse.json({ 
      success: true, 
      profile: result,
      message: existingProfile ? 'Profile updated' : 'Profile created'
    });

  } catch (error: any) {
    console.error('❌ Profile sync error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}