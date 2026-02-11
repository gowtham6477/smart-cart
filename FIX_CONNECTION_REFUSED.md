# 🚨 CONNECTION REFUSED ERROR - SOLUTION GUIDE

## Error Summary

```
ERR_CONNECTION_REFUSED on http://localhost:8080
```

**Root Cause**: Backend server is NOT running on port 8080.

---

## ✅ QUICK FIX - Start Backend Server

### Option 1: Use Provided Batch File (Easiest)

**Double-click this file**:
```
START-BACKEND-AND-FRONTEND.bat
```

Or run in PowerShell:
```powershell
.\run-all.bat
```

### Option 2: Manual Start (Step by Step)

#### Step 1: Start Backend

Open PowerShell in project folder:
```powershell
cd "E:\Smart service management\smartcart"
.\mvnw.cmd spring-boot:run
```

Wait for this message:
```
Started Smart Service Management System in X.XXX seconds
```

#### Step 2: Start Frontend (New Terminal)

Open another PowerShell:
```powershell
cd "E:\Smart service management\smartcart\frontend"
npm run dev
```

Wait for:
```
Local: http://localhost:5173/
```

#### Step 3: Open Browser

Navigate to: `http://localhost:5173`

---

## 🔍 Verify Backend is Running

### Check if Port 8080 is in Use

```powershell
# PowerShell
netstat -ano | findstr :8080
```

Expected output:
```
TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    12345
```

If you see output, backend is running ✅  
If no output, backend is NOT running ❌

### Test Backend Health

Open browser or use curl:
```
http://localhost:8080/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

---

## 🛠️ Troubleshooting

### Issue 1: Port 8080 Already in Use

**Error Message**:
```
***************************
APPLICATION FAILED TO START
***************************

Description:
Web server failed to start. Port 8080 was already in use.
```

**Solution**:
```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Example output:
# TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    12345
#                                                   ^^^^^ This is the PID

# Kill the process
taskkill /PID 12345 /F

# Then restart backend
.\mvnw.cmd spring-boot:run
```

### Issue 2: Java Not Found

**Error Message**:
```
'java' is not recognized as an internal or external command
```

**Solution**:
1. Install Java 17 or higher
2. Download from: https://adoptium.net/
3. Add to PATH
4. Verify: `java -version`

### Issue 3: Maven Build Fails

**Error Message**:
```
[ERROR] Failed to execute goal...
```

**Solution**:
```powershell
# Clean and rebuild
.\mvnw.cmd clean install

# If still fails, skip tests
.\mvnw.cmd clean install -DskipTests

# Then run
.\mvnw.cmd spring-boot:run
```

### Issue 4: MongoDB Connection Error

**Error Message**:
```
MongoTimeoutException: Timed out after 30000 ms
```

**Solution**:
1. Check `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://...
   ```
2. Verify internet connection
3. Check MongoDB Atlas cluster is running
4. Whitelist your IP in MongoDB Atlas

### Issue 5: Backend Starts But Crashes

**Check Backend Logs**:

Look for errors in console output. Common issues:
- Missing dependencies
- Database connection failed
- Port already in use
- Configuration errors

---

## 📋 Pre-Flight Checklist

Before starting, verify:

- [ ] Java 17+ installed: `java -version`
- [ ] Maven working: `.\mvnw.cmd --version`
- [ ] Node.js installed: `node --version`
- [ ] MongoDB URI configured in `application.properties`
- [ ] Port 8080 is free
- [ ] Port 5173 is free (frontend)
- [ ] Internet connection active

---

## 🚀 Complete Startup Sequence

### Full System Start (Backend + Frontend)

Create and run this batch file:

**File: `START-EVERYTHING.bat`**
```batch
@echo off
echo ========================================
echo  Starting Smart Service Management
echo ========================================

echo.
echo [1/3] Checking Java...
java -version
if errorlevel 1 (
    echo ERROR: Java not found!
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && mvnw.cmd spring-boot:run"

echo.
echo Waiting for backend to start (30 seconds)...
timeout /t 30 /nobreak

echo.
echo [3/3] Starting Frontend...
start "Frontend Dev Server" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ========================================
echo  System Starting...
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Wait for both servers to fully start,
echo then open: http://localhost:5173
echo.
pause
```

**Usage**:
```powershell
# Just double-click the file
START-EVERYTHING.bat
```

---

## 🔧 Quick Commands Reference

### Backend Commands

```powershell
# Start backend
.\mvnw.cmd spring-boot:run

# Clean build
.\mvnw.cmd clean install

# Skip tests
.\mvnw.cmd clean install -DskipTests

# Stop backend (Ctrl+C in terminal)
```

### Frontend Commands

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Stop frontend (Ctrl+C in terminal)
```

### Port Management

```powershell
# Check what's using port 8080
netstat -ano | findstr :8080

# Kill process by PID
taskkill /PID <PID> /F

# Check what's using port 5173
netstat -ano | findstr :5173
```

---

## 🌐 Test API Endpoints

Once backend is running, test these endpoints:

### 1. Health Check
```
GET http://localhost:8080/actuator/health
```

### 2. Login (Get Token)
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "employee1@smart.com",
  "password": "employee123"
}
```

### 3. Employee Dashboard
```
GET http://localhost:8080/api/employee/dashboard/stats
Authorization: Bearer <your_token>
```

### 4. Employee Tasks
```
GET http://localhost:8080/api/employee/tasks
Authorization: Bearer <your_token>
```

---

## 📱 Frontend Access

Once both servers are running:

1. **Open Browser**: http://localhost:5173
2. **Login as Employee**:
   - Email: `employee1@smart.com`
   - Password: `employee123`
3. **Navigate to Dashboard**
4. **Upload Images to Tasks**

---

## ⚠️ Common Mistakes

### Mistake 1: Not Starting Backend First
❌ Starting frontend before backend  
✅ Always start backend first, wait for it to start, then start frontend

### Mistake 2: Wrong Directory
❌ Running commands from wrong folder  
✅ Backend commands: `E:\Smart service management\smartcart`  
✅ Frontend commands: `E:\Smart service management\smartcart\frontend`

### Mistake 3: Port Conflicts
❌ Another app using port 8080 or 5173  
✅ Kill conflicting processes or change ports

### Mistake 4: No Internet
❌ MongoDB Atlas needs internet  
✅ Check internet connection before starting

---

## 📊 Expected Startup Logs

### Backend Startup (Good)
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

Smart Service Management System :: Running on port 8080

2026-02-04 18:30:15.123  INFO --- [main] o.e.SmartServiceApplication : Started SmartServiceApplication in 12.345 seconds
```

### Frontend Startup (Good)
```
VITE v5.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
```

---

## 🆘 Still Having Issues?

### Step-by-Step Diagnosis

1. **Verify Java**:
   ```powershell
   java -version
   # Should show: openjdk version "17.0.x" or higher
   ```

2. **Verify Node**:
   ```powershell
   node --version
   # Should show: v18.x.x or higher
   ```

3. **Test MongoDB**:
   - Login to MongoDB Atlas
   - Check cluster is running (green)
   - Verify connection string in `application.properties`

4. **Check Firewall**:
   - Windows Firewall might block ports
   - Allow Java and Node.js through firewall

5. **Check Logs**:
   - Backend: Look at console output for errors
   - Frontend: Check browser console (F12)

---

## 📞 Emergency Commands

### Kill All Java Processes
```powershell
# Use with caution!
taskkill /F /IM java.exe
```

### Kill All Node Processes
```powershell
# Use with caution!
taskkill /F /IM node.exe
```

### Reset Everything
```powershell
# Stop all
taskkill /F /IM java.exe
taskkill /F /IM node.exe

# Clean backend
cd "E:\Smart service management\smartcart"
.\mvnw.cmd clean

# Clean frontend
cd frontend
rm -rf node_modules
npm install

# Start fresh
cd ..
.\mvnw.cmd spring-boot:run
# Wait... then in new terminal:
cd frontend
npm run dev
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Backend console shows: "Started SmartServiceApplication"
2. ✅ Frontend console shows: "Local: http://localhost:5173/"
3. ✅ Browser opens `http://localhost:5173` without errors
4. ✅ Login page loads
5. ✅ Can login as employee
6. ✅ Dashboard loads with no "Connection Refused" errors
7. ✅ Can upload images successfully

---

## 📚 Related Files

- `run-all.bat` - Start both servers
- `run-backend.bat` - Start only backend
- `RESTART-BACKEND.bat` - Restart backend
- `HOW_TO_RUN.md` - Full setup guide
- `IMAGE_UPLOAD_FIX_COMPLETE.md` - Image upload documentation
- `CLOUDINARY_FILE_STORAGE_INFO.md` - File storage info

---

**Last Updated**: February 4, 2026  
**Issue**: ERR_CONNECTION_REFUSED  
**Solution**: Start backend server on port 8080

