# Google OAuth Troubleshooting Guide

## Common Issues and Solutions

### 1. "Error 400: redirect_uri_mismatch"
**Solution:** Check that your redirect URIs in Google Cloud Console exactly match:
- `http://localhost:3001/auth/callback`
- `https://xpasvhmwuhipzvcqohhq.supabase.co/auth/v1/callback`

### 2. "Error 403: access_denied"
**Solution:** 
- Make sure Google OAuth is enabled in Supabase
- Check that Client ID and Secret are correctly entered in Supabase
- Verify your Google Cloud Console project is active

### 3. "Error 400: invalid_request"
**Solution:**
- Ensure Privacy Policy and Terms URLs are accessible
- Check that your app is not in "Testing" mode in Google Cloud Console
- Verify all required fields are filled in Google Cloud Console

### 4. OAuth Consent Screen Issues
**Solution:**
- Add your email to test users if app is in testing mode
- Fill out all required fields in OAuth consent screen
- Add your domain to authorized domains

### 5. Profile Not Created After Google Login
**Solution:**
- Make sure you've run the `profile-sync-fix.sql` script
- Check that the auth callback route is working
- Verify RLS policies allow profile creation

## Testing Checklist

- [ ] Google Cloud Console OAuth client created
- [ ] Correct redirect URIs added to Google
- [ ] Privacy Policy accessible at `/privacy`
- [ ] Terms of Service accessible at `/terms`
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Database tables created (run basic-setup.sql)
- [ ] Profile sync triggers created (run profile-sync-fix.sql)
- [ ] Site URL configured in Supabase

## Quick Test Steps

1. Go to http://localhost:3001/signup
2. Click "Sign up with Google"
3. Should redirect to Google consent screen
4. After approval, should redirect back to your site
5. Check if profile is created in Supabase profiles table

## Support

If issues persist:
- Check browser console for errors
- Check Supabase logs in dashboard
- Verify all URLs are exactly correct (no trailing slashes)
- Try in incognito mode to clear cache