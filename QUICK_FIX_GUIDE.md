# 🚀 QUICK FIX GUIDE - Token Authentication Error

## ❌ The Error You're Seeing
```
POST http://localhost:8080/api/customer/bookings 400 (Bad Request)
Error: The given id must not be null
```

## ✅ The Problem
Your JWT authentication token is **outdated** and doesn't include the `userId` field that the backend now requires.

## 🔧 SOLUTION (Choose One Method)

### 🎯 Method 1: AUTOMATED FIX (Recommended)

1. **Double-click this file:**
   ```
   fix-and-restart.bat
   ```
   
2. **In your browser:**
   - Go to: http://localhost:5173/clear-session.html
   - Click "Clear My Session"
   - Click "Go to Login Page"
   
3. **Login again** with your credentials

4. **Test checkout** - Should work now! ✅

---

### 🎯 Method 2: MANUAL FIX

#### Step 1: Restart Backend
```bash
# Stop current backend (press Ctrl+C in the terminal)
# Then run:
.\mvnw.cmd spring-boot:run
```

#### Step 2: Clear Browser Session
**Option A - Use the Clear Session Page:**
- Open: http://localhost:5173/clear-session.html
- Click "Clear My Session"

**Option B - Manual Clear (in Browser Console):**
```javascript
localStorage.removeItem('accessToken');
localStorage.removeItem('user');
location.reload();
```

#### Step 3: Login Again
- Go to: http://localhost:5173/auth/login
- Enter your credentials
- Get a fresh token with userId

#### Step 4: Test
- Add items to cart
- Proceed to checkout
- Create booking ✅

---

## 📋 What Was Fixed

### Backend Changes:
✅ Added userId validation in CustomerController  
✅ Added userId validation in EmployeeController  
✅ Better error messages for debugging  
✅ Enhanced logging in BookingService  

### Frontend Changes:
✅ Auto-detection of old tokens  
✅ Auto-logout for invalid tokens  
✅ Better error handling in API client  
✅ Fixed packageId handling in Cart  

---

## 🎯 Quick Links

- **Clear Session Page:** http://localhost:5173/clear-session.html
- **Login Page:** http://localhost:5173/auth/login
- **Home Page:** http://localhost:5173/

---

## ❓ Troubleshooting

### Still getting the error?
1. Make sure backend is **restarted** (you should see "Started SmartcartApplication")
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito/private browsing mode
4. Check browser console for any JavaScript errors

### Backend not starting?
```bash
# Clean and rebuild
.\mvnw.cmd clean install -DskipTests
.\mvnw.cmd spring-boot:run
```

### Frontend not loading?
```bash
cd frontend
npm install
npm run dev
```

---

## ✨ After the Fix

Everything will work:
- ✅ User authentication
- ✅ Product browsing
- ✅ Cart management
- ✅ Checkout & bookings
- ✅ Order tracking
- ✅ Profile management
- ✅ Admin dashboard
- ✅ Employee dashboard

---

## 📖 Technical Details

See **TOKEN_FIX_COMPLETE.md** for full technical documentation.

---

**Status:** ✅ Fix implemented and ready to deploy  
**Date:** December 22, 2025  
**Action Required:** Restart backend + Clear session + Login again

