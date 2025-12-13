# 🚨 URGENT: Fix "Database error saving new user"

## The Problem
You're getting this error because the Supabase database tables don't exist yet.

## The Solution (3 Simple Steps)

### ✅ Step 1: Open Supabase SQL Editor
Go to: https://fshfvihunprbqlukbdpi.supabase.co/project/fshfvihunprbqlukbdpi/sql

### ✅ Step 2: Run the Setup SQL
1. Click **"New Query"**
2. Open file: `supabase-setup.sql` (in your project)
3. Copy **ALL** the contents (Ctrl+A, Ctrl+C)
4. Paste into the SQL editor
5. Click **"Run"** button (or press Ctrl+Enter)
6. You should see: ✅ "Success. No rows returned"

### ✅ Step 3: Test Login
1. Clear your browser cache/cookies
2. Go to http://localhost:3000/
3. Click **"Login"** button
4. Authorize with Discord
5. Should work now! ✅

---

## What Was Fixed

### ✅ Auth Added to ALL Pages
- Replaced search boxes with Login/Profile buttons
- Added to all 70+ HTML files (chapters, roadmaps, FAQ, etc.)
- Profile shows Discord avatar with username on hover

### ✅ Database Error Fixed
- Updated `supabase-setup.sql` to handle existing policies
- Creates tables: `profiles`, `lab_codes`, `lab_sessions`
- Sets up triggers and security policies

### ✅ Shared Auth Script
- Created `auth.js` for consistent authentication across all pages
- Auto-detects login state
- Shows Discord avatar with username tooltip on hover
- No more search boxes - just clean auth UI

---

## If Still Not Working

1. **Check Discord OAuth is configured in Supabase:**
   - Go to: https://fshfvihunprbqlukbdpi.supabase.co/project/fshfvihunprbqlukbdpi/auth/providers
   - Make sure Discord is enabled
   - Client ID and Secret are filled in

2. **Check redirect URL in Discord:**
   - Go to: https://discord.com/developers/applications
   - Select your application
   - OAuth2 → Redirects should have:
     `https://fshfvihunprbqlukbdpi.supabase.co/auth/v1/callback`

3. **Check browser console for errors:**
   - Press F12
   - Go to Console tab
   - Look for any red errors
   - Share them if you need help

---

## Testing

After running the SQL:
1. ✅ Login button appears on all pages
2. ✅ Click Login → redirects to Discord
3. ✅ Authorize → redirects back to site
4. ✅ Your Discord avatar appears in header
5. ✅ Hover over avatar → see your username
6. ✅ Click Logout → logs you out

---

## Files Changed

- ✅ `supabase-setup.sql` - Fixed policy errors
- ✅ `auth.js` - NEW shared auth script
- ✅ `index.html` - Updated with auth
- ✅ `lab.html` - Updated with auth
- ✅ ALL 70+ HTML files - Auth added automatically

---

## Next Steps

Push to GitHub:
```bash
git add .
git commit -m "Add Discord auth to all pages, fix database setup"
git push
```

Then test on Vercel: https://nullnode.vercel.app/
