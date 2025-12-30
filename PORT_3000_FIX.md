# Port 3000 Fix - Free Up Port and Start Development Server

## 🚨 **Issue**: Port 3000 is occupied or Google OAuth not working

## ✅ **Step 1: Free Port 3000**

### **Windows (Your System):**
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# If something is found, kill it (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Alternative: Kill all Node.js processes
taskkill /IM node.exe /F
```

### **Mac/Linux:**
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

## ✅ **Step 2: Start Your Development Server**

```bash
# Navigate to your project directory
cd "C:\Users\qsh4l\Downloads\project-bolt-stackblitz-starters-pxdue9wo (2)"

# Install dependencies (if needed)
npm install

# Start development server on port 3000
npm run dev
```

Your app should now be running on: `http://localhost:3000`

## ✅ **Step 3: Verify Server is Running**

1. **Open browser** and go to: `http://localhost:3000`
2. **Should see**: Your Niwas Nest homepage
3. **If not working**: Check terminal for errors

## ✅ **Step 4: Test Google OAuth**

After your server is running:

1. **Go to**: `http://localhost:3000/signup`
2. **Click**: "Sign up with Google"
3. **Expected**: Should redirect to Google (if configured) or show error message

## 🔧 **Alternative: Use Different Port**

If port 3000 keeps getting occupied:

```bash
# Start on port 3001 instead
npm run dev -- -p 3001
```

Then update Google Cloud Console URLs to use port 3001:
- `http://localhost:3001/auth/callback`

## 🚨 **Common Port 3000 Conflicts**

Port 3000 is commonly used by:
- **Other Next.js apps**
- **React development servers**
- **Node.js applications**
- **Docker containers**
- **Other development tools**

## ✅ **Quick Fix Commands**

```bash
# Kill all Node processes (nuclear option)
taskkill /IM node.exe /F

# Start fresh
npm run dev
```

## 📱 **After Port is Free**

1. ✅ **Server running**: `http://localhost:3000`
2. ✅ **Google OAuth URLs updated**: Port 3000 in all configs
3. ✅ **Ready to test**: Google sign-up should work

---

**Port 3000 should now be free for your Niwas Nest app! 🎉**