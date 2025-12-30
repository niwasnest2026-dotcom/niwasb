# Google OAuth Setup Fix - Complete Guide

## 🚨 **Current Issue**: "This site can't be reached" Error

The error you're seeing happens because Google OAuth isn't properly configured. Here's the complete fix:

## ✅ **Step 1: Check Your Development Server**

Make sure your development server is running on the correct port:

```bash
npm run dev
```

Your app should be running on: `http://localhost:3000`

## ✅ **Step 2: Free Port 3000 (If Needed)**

If port 3000 is occupied, find and kill the process:

### **Windows:**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### **Mac/Linux:**
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

## ✅ **Step 3: Google Cloud Console Setup**

### **3.1 Create Google Cloud Project (if not done)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "Niwas Nest" or similar

### **3.2 Enable Google+ API**
1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API" 
3. Click **Enable**

### **3.3 Configure OAuth Consent Screen**
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill required fields:
   - **App name**: Niwas Nest
   - **User support email**: Your email
   - **Developer contact**: Your email
   - **App domain**: `localhost:3000` (for development)
   - **Privacy Policy URL**: `http://localhost:3000/privacy`
   - **Terms of Service URL**: `http://localhost:3000/terms`

### **3.4 Create OAuth Client ID**
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Choose **Web application**
4. Name: "Niwas Nest Web Client"
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://www.niwasnest.com
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://www.niwasnest.com/auth/callback
   https://xpasvhmwuhipzvcqohhq.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. **Copy the Client ID and Client Secret**

## ✅ **Step 4: Supabase Configuration**

### **4.1 Configure Google Provider in Supabase**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `xpasvhmwuhipzvcqohhq`
3. Go to **Authentication** > **Providers**
4. Find **Google** and click **Configure**
5. **Enable Google provider**
6. Enter your **Client ID** and **Client Secret** from Google Cloud Console
7. Click **Save**

### **4.2 Configure Site URL**
1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://www.niwasnest.com/auth/callback
   ```

## ✅ **Step 5: Test the Setup**

### **5.1 Clear Browser Cache**
1. Open browser in **Incognito/Private mode**
2. Or clear all cookies and cache for localhost

### **5.2 Test Google OAuth**
1. Go to `http://localhost:3000/signup`
2. Click "Sign up with Google"
3. Should redirect to Google consent screen
4. After approval, should redirect back to your homepage

## ✅ **Step 6: Troubleshooting Common Issues**

### **Issue: "Error 400: redirect_uri_mismatch"**
**Fix**: Double-check that redirect URIs in Google Cloud Console exactly match:
- `http://localhost:3000/auth/callback`
- `https://xpasvhmwuhipzvcqohhq.supabase.co/auth/v1/callback`

### **Issue: "Error 403: access_denied"**
**Fix**: 
- Add your email to test users in Google Cloud Console
- Make sure OAuth consent screen is properly filled
- Check that Google+ API is enabled

### **Issue: Still getting "This site can't be reached"**
**Fix**:
1. Check if your dev server is running on port 3000
2. Try `http://localhost:3000` directly in browser
3. Check firewall/antivirus blocking localhost
4. Try different browser or incognito mode
5. Make sure no other app is using port 3000

### **Issue: Port 3000 is busy**
**Fix**:
1. Kill the process using port 3000 (see Step 2 above)
2. Or change your Next.js port:
   ```bash
   npm run dev -- -p 3001
   ```
   Then update all URLs to use port 3001

## ✅ **Step 7: Production Setup (When Ready)**

When deploying to production:

1. **Update Google Cloud Console**:
   - Add production domain to authorized origins
   - Add production callback URL

2. **Update Supabase**:
   - Change Site URL to production domain
   - Add production redirect URLs

## 🔧 **Code Changes Made**

I've already fixed the code to:
- ✅ Handle port 3000 properly
- ✅ Add better error logging
- ✅ Provide fallback for localhost:3000
- ✅ Add proper error messages

## 📞 **Need Help?**

If you're still having issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify all URLs match exactly (no trailing slashes)
4. Make sure your development server is running on port 3000

---

**After following these steps, Google OAuth should work perfectly! 🎉**