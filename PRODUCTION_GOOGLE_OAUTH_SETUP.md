# Production Google OAuth Setup - www.niwasnest.com

## 🚀 **Google OAuth for Live Website Configuration**

This guide will set up Google OAuth for your production website: **www.niwasnest.com**

## ✅ **Step 1: Google Cloud Console Setup**

### **1.1 Create/Access Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project or create "Niwas Nest Production"

### **1.2 Enable Required APIs**
1. Go to **APIs & Services** > **Library**
2. Search and enable:
   - **Google+ API**
   - **Google Identity Services API**

### **1.3 Configure OAuth Consent Screen**
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill **REQUIRED** fields:
   - **App name**: Niwas Nest
   - **User support email**: Your business email
   - **Developer contact**: Your business email
   - **App domain**: `niwasnest.com`
   - **Privacy Policy URL**: `https://www.niwasnest.com/privacy`
   - **Terms of Service URL**: `https://www.niwasnest.com/terms`
4. **Scopes**: Add `email`, `profile`, `openid`
5. **Test users**: Add your email for testing

### **1.4 Create OAuth Client (Development + Production)**
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Choose **Web application**
4. Name: **"Niwas Nest Web Client"**
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://www.niwasnest.com
   https://niwasnest.com
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://www.niwasnest.com/auth/callback
   https://niwasnest.com/auth/callback
   https://xpasvhmwuhipzvcqohhq.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. **IMPORTANT**: Copy and save:
   - **Client ID** (starts with numbers, ends with .apps.googleusercontent.com)
   - **Client Secret** (random string)

## ✅ **Step 2: Supabase Production Configuration**

### **2.1 Configure Google Provider**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `xpasvhmwuhipzvcqohhq`
3. Go to **Authentication** > **Providers**
4. Find **Google** provider
5. **Enable** the toggle
6. Enter your production **Client ID** and **Client Secret**
7. Click **Save**

### **2.2 Configure URLs (Development + Production)**
1. Go to **Authentication** > **URL Configuration**
2. **Site URL**: `https://www.niwasnest.com` (primary)
3. **Redirect URLs** (add ALL of these):
   ```
   http://localhost:3000/auth/callback
   https://www.niwasnest.com/auth/callback
   https://niwasnest.com/auth/callback
   https://www.niwasnest.com/**
   https://niwasnest.com/**
   http://localhost:3000/**
   ```
4. Click **Save**

## ✅ **Step 3: Domain Verification (Important)**

### **3.1 Verify Domain Ownership**
1. In Google Cloud Console, go to **APIs & Services** > **Domain verification**
2. Add domain: `niwasnest.com`
3. Follow verification steps (DNS record or HTML file)

### **3.2 Add Domain to OAuth Consent**
1. Go back to **OAuth consent screen**
2. In **Authorized domains**, add:
   - `niwasnest.com`
   - `www.niwasnest.com`

## ✅ **Step 4: Test OAuth (Both Environments)**

### **4.1 Test Local Development**
1. **Start server**: `npm run dev` (should run on http://localhost:3000)
2. **Visit**: `http://localhost:3000/signup`
3. **Click**: "Sign up with Google"
4. **Expected**: Redirects to Google, then back to localhost

### **4.2 Test Production Website**
1. **Visit**: `https://www.niwasnest.com/signup`
2. **Click**: "Sign up with Google"
3. **Expected**: Redirects to Google, then back to production site

## ✅ **Step 5: Troubleshooting Production Issues**

### **Issue: "Error 400: redirect_uri_mismatch"**
**Fix**: Verify these URLs match EXACTLY in Google Cloud Console:
- `https://www.niwasnest.com/auth/callback`
- `https://xpasvhmwuhipzvcqohhq.supabase.co/auth/v1/callback`

### **Issue: "Error 403: access_denied"**
**Fix**: 
- Verify domain ownership in Google Cloud Console
- Add your email to test users
- Check OAuth consent screen is complete

### **Issue: "This app isn't verified"**
**Solutions**:
1. **For testing**: Click "Advanced" > "Go to Niwas Nest (unsafe)"
2. **For production**: Submit app for Google verification (takes 1-2 weeks)
3. **Quick fix**: Add users to "Test users" list in OAuth consent screen

### **Issue: SSL/HTTPS Problems**
**Fix**:
- Ensure your website has valid SSL certificate
- All URLs must use `https://` not `http://`
- Check that `www.niwasnest.com` redirects properly

## ✅ **Step 6: App Verification (Optional but Recommended)**

For public launch without "unverified app" warning:

1. **Go to**: OAuth consent screen > **Publishing status**
2. **Click**: "PUBLISH APP"
3. **Submit for verification** (if you have 100+ users)
4. **Provide**:
   - App description
   - Privacy policy
   - Terms of service
   - YouTube demo video

## 🔧 **Code Changes Made**

✅ **Updated OAuth redirects** to use `https://www.niwasnest.com`
✅ **Production-ready** fallback URLs
✅ **Proper error handling** for production environment

## 📋 **Quick Checklist**

- [ ] Google Cloud project created
- [ ] APIs enabled (Google+, Identity Services)
- [ ] OAuth consent screen completed
- [ ] Production OAuth client created with correct URLs
- [ ] Supabase Google provider configured
- [ ] Supabase Site URL set to production domain
- [ ] Domain ownership verified
- [ ] Website deployed with SSL
- [ ] OAuth flow tested on live site

## 🎯 **Final Result**

After setup, users can:
1. **Visit**: `https://www.niwasnest.com/signup`
2. **Click**: "Sign up with Google"
3. **Get**: Seamless Google OAuth login
4. **Access**: Full website functionality

---

**Your production Google OAuth will work perfectly! 🎉**