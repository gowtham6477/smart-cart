# ✅ COMPLETE FIX - "Customer not found" Error

## 🎯 The Problem Explained

You're seeing **"Customer not found"** and **Registration fails** because:

1. **Old JWT Token**: Your browser has a token from a deleted/non-existent user
2. **Token Still Valid**: JWT hasn't expired, so frontend thinks you're logged in
3. **User Not in DB**: Backend tries to find user by token's userId → not found
4. **Registration Fails**: Email/mobile already exists in DB

## ✅ The Complete Solution

### Option 1: Use Helper Page (EASIEST) ⭐

**Go to**: http://localhost:5173/fix-auth.html

This page will:
1. ✅ Clear all old auth data
2. ✅ Auto-login with test customer
3. ✅ Redirect to products
4. ✅ Orders will work!

**Just click the buttons** - it handles everything automatically!

---

### Option 2: Manual Fix (30 seconds)

#### Step 1: Clear Auth Storage
Open browser console (`F12`) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### Step 2: Login (DON'T Register)
```
Email: customer@test.com
Password: customer123
```

#### Step 3: Test
- Browse `/products`
- Add to cart
- Checkout
- ✅ Success!

---

## 🔍 Why This Happened

### Before Fix:
```
Browser localStorage: {token: "OLD_JWT", userId: "deleted-user-123"}
                                ↓
                         Backend Database
                                ↓
                      ❌ User not found!
```

### After Fix:
```
Clear localStorage → Fresh login → New JWT
                                ↓
                         Backend Database
                                ↓
                     ✅ User found: customer@test.com
```

---

## 📋 Verification Steps

### 1. Check Current Auth State
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('auth-storage')));
```

Should show:
```json
{
  "state": {
    "user": {
      "email": "customer@test.com",
      "name": "Test Customer"
    },
    "isAuthenticated": true
  }
}
```

### 2. Test API Call
```javascript
// In browser console
fetch('http://localhost:8080/api/customer/bookings', {
  headers: {
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage')).state.token}`
  }
}).then(r => r.json()).then(console.log);
```

Should return bookings data, NOT "Customer not found".

---

## 🚀 Quick Test After Fix

1. **Login**: `customer@test.com` / `customer123` ✅
2. **Go to**: http://localhost:5173/products ✅
3. **Add to cart**: Click "Add to cart" on 2-3 items ✅
4. **View cart**: http://localhost:5173/cart ✅
5. **Checkout**: Click "Place Order" ✅
6. **Success!**: See orders in `/my/orders` ✅
7. **Admin view**: Login as admin → `/admin/orders` ✅

---

## ❌ Common Mistakes

### Mistake 1: Trying to Register Again
**Problem**: Email/mobile already exists
**Solution**: Use existing test customer (`customer@test.com`)

### Mistake 2: Not Clearing Storage
**Problem**: Old token still in localStorage
**Solution**: Must clear before login

### Mistake 3: Using Wrong Credentials
**Problem**: Typing wrong email/password
**Solution**: 
- Email: `customer@test.com` (exact)
- Password: `customer123` (exact)

---

## 🔧 If Still Not Working

### Check Backend Logs
Look for:
```
Test customer created successfully: customer@test.com
```

### Check Backend is Running
```powershell
# In terminal
curl http://localhost:8080/actuator/health
```

Should return: `{"status":"UP"}`

### Check Frontend Token
```javascript
// In console
const auth = JSON.parse(localStorage.getItem('auth-storage'));
console.log('User:', auth?.state?.user?.email);
console.log('Token exists:', !!auth?.state?.token);
```

Should show:
```
User: customer@test.com
Token exists: true
```

---

## 📞 Support Info

### Test Accounts
**Customer**: 
- Email: `customer@test.com`
- Password: `customer123`

**Admin**:
- Email: `admin@gmail.com`
- Password: `admin123`

### Backend Status
- URL: http://localhost:8080
- Health: http://localhost:8080/actuator/health

### Frontend
- URL: http://localhost:5173
- Fix Page: http://localhost:5173/fix-auth.html

---

## ✨ Summary

**Problem**: Old JWT token → "Customer not found"

**Solution**: 
1. Clear auth storage
2. Login with `customer@test.com` / `customer123`
3. Place orders - Works! ✅

**Helper Page**: http://localhost:5173/fix-auth.html

**Result**: Orders work end-to-end! 🎉

---

## 🎯 DO THIS NOW

### FASTEST FIX (10 seconds):
1. Open: http://localhost:5173/fix-auth.html
2. Click: "Clear Auth Storage"
3. Click: "Auto Login"
4. Click: "Go to Products"
5. **DONE!** ✅

Try it now! The helper page fixes everything automatically! 🚀

