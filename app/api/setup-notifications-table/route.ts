import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Setting up notifications table...');

    // Check if notifications table exists by trying to select from it
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (error && error.message.includes('relation "notifications" does not exist')) {
      console.log('📝 Notifications table does not exist, creating...');
      
      // Create notifications table using raw SQL
      const { error: createError } = await supabase.rpc('create_notifications_table');
      
      if (createError) {
        console.log('⚠️ Could not create table via RPC, table might need manual creation');
        return NextResponse.json({
          success: false,
          error: 'Notifications table needs to be created manually',
          sql: `
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,
  user_id UUID REFERENCES profiles(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
          `.trim()
        });
      }
    }

    // Test inserting a sample notification
    const { data: testNotification, error: insertError } = await supabase
      .from('notifications')
      .insert([{
        type: 'system',
        title: 'Notifications System Ready',
        message: 'Real-time notifications system has been set up successfully',
        data: { setup_time: new Date().toISOString() },
        is_read: false
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error('Failed to create test notification: ' + insertError.message);
    }

    console.log('✅ Notifications table setup complete');

    return NextResponse.json({
      success: true,
      message: 'Notifications table setup complete',
      test_notification: testNotification
    });

  } catch (error: any) {
    console.error('❌ Notifications setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      manual_sql: `
-- Run this SQL in your Supabase SQL editor:

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,
  user_id UUID REFERENCES profiles(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
      `.trim()
    }, { status: 500 });
  }
}