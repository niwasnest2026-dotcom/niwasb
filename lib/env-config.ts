// Environment configuration with fallbacks for production
export const ENV_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xpasvhmwuhipzvcqohhq.supabase.co',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwYXN2aG13dWhpcHp2Y3FvaGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTk5ODMsImV4cCI6MjA4MjA3NTk4M30.mFM1oZXZ5NvFzXJOXoU7T6OGAu6pPlDQPCbolh-z6M0',
  
  // Service role key - this should be rotated after the security fix
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwYXN2aG13dWhpcHp2Y3FvaGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ5OTk4MywiZXhwIjoyMDgyMDc1OTgzfQ.OxhiMU3PjWc9OIityt7NWCmWq90VrCihFulZKu8Isy4',
  
  // Razorpay Configuration
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '2yXHlj5JUdfJRK0Ile7x53LU',
  
  // Site URL
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.niwasnest.com'
};

// Validation function
export function validateEnvironment() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'RAZORPAY_KEY_SECRET'
  ];
  
  const missing = required.filter(key => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}

// Debug function
export function debugEnvironment() {
  return {
    supabase_url: !!ENV_CONFIG.SUPABASE_URL,
    supabase_anon_key: !!ENV_CONFIG.SUPABASE_ANON_KEY,
    service_role_key: !!ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
    razorpay_secret: !!ENV_CONFIG.RAZORPAY_KEY_SECRET,
    node_env: process.env.NODE_ENV,
    available_env_keys: Object.keys(process.env).filter(key => 
      key.includes('SUPABASE') || key.includes('RAZORPAY')
    )
  };
}