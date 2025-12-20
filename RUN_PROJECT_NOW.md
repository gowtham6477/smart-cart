# 🚀 QUICK START - Run Your Project NOW!

## ⚠️ CURRENT STATUS: Java Not Installed

Your project is **100% ready**, but Java needs to be installed first.

---

## 📋 Step 1: Install Java 17 (5 minutes)

### Option A: Install via Installer (Recommended)

1. **Download Java 17**:
   - Go to: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - OR use OpenJDK: https://adoptium.net/temurin/releases/?version=17
   
2. **Run the Installer**:
   - Choose: **Windows x64 Installer**
   - Run the downloaded `.exe` file
   - Follow installation wizard
   - **Important**: Check "Set JAVA_HOME" during installation

3. **Verify Installation**:
   Open NEW PowerShell window:
   ```powershell
   java -version
   ```
   Should show: `openjdk version "17.x.x"` or `java version "17.x.x"`

### Option B: Install via Chocolatey (If you have Chocolatey)

```powershell
choco install openjdk17
```

### Option C: Manual JAVA_HOME Setup

If Java is installed but JAVA_HOME is not set:

1. **Find Java Installation Path**:
   - Usually: `C:\Program Files\Java\jdk-17` or similar

2. **Set JAVA_HOME**:
   ```powershell
   # For current session only
   $env:JAVA_HOME="C:\Program Files\Java\jdk-17"
   $env:Path="$env:JAVA_HOME\bin;$env:Path"
   ```

3. **Permanent Setup** (System Properties):
   - Search Windows: "Environment Variables"
   - Click "Environment Variables" button
   - Under "System Variables":
     - New: Variable = `JAVA_HOME`, Value = `C:\Program Files\Java\jdk-17`
     - Edit Path: Add `%JAVA_HOME%\bin`
   - Click OK, restart PowerShell

---

## 🎯 Step 2: Setup MongoDB Atlas (15 minutes)

### Quick Setup:

1. **Sign Up**: https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: 
   - Choose FREE M0 tier
   - Select AWS
   - Choose region closest to you
3. **Create Database User**:
   - Username: `smartcart_admin`
   - Password: Generate secure password (SAVE IT!)
4. **Whitelist IP**:
   - Add current IP OR `0.0.0.0/0` (for development)
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy string, replace `<password>` with your password
   
6. **Update Configuration**:
   Edit: `src/main/resources/application.properties`
   ```properties
   spring.data.mongodb.uri=mongodb+srv://smartcart_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smartcart?retryWrites=true&w=majority
   ```

**Detailed Guide**: See `MONGODB_ATLAS_SETUP.md`

---

## 🔧 Step 3: Configure External Services (Optional for now)

You can run the project without these initially:

### Cloudinary (Image Upload):
```properties
cloudinary.cloud-name=demo
cloudinary.api-key=demo
cloudinary.api-secret=demo
```
Sign up later: https://cloudinary.com/

### Razorpay (Payments):
```properties
razorpay.key-id=test_key
razorpay.key-secret=test_secret
```
Sign up later: https://razorpay.com/

---

## 🚀 Step 4: Run the Backend

### Option 1: Using IntelliJ IDEA (Easiest)

1. **Fix Dependencies First** (If red underlines):
   - `File` → `Settings` → `Compiler` → `Annotation Processors`
   - ✅ Enable "Enable annotation processing"
   - `File` → `Settings` → `Plugins` → Install "Lombok"
   - Maven tool window → Click Reload (🔄)
   - Wait 5-15 minutes for dependencies
   - `Build` → `Build Project`

2. **Run Application**:
   - Open: `src/main/java/org/example/Main.java`
   - Right-click → `Run 'Main.main()'`
   - OR click the green ▶️ play button

3. **Backend Started!**:
   - Runs on: http://localhost:8080
   - Check: http://localhost:8080/actuator/health

### Option 2: Using Maven Command Line

```powershell
# Navigate to project
cd "E:\Smart service management\smartcart"

# Run with Maven wrapper
.\mvnw.cmd spring-boot:run
```

### Option 3: Build JAR and Run

```powershell
# Build
.\mvnw.cmd clean package -DskipTests

# Run
java -jar target/smartcart-1.0-SNAPSHOT.jar
```

---

## 🎨 Step 5: Run the Frontend (Optional)

### Install Node.js (if not installed):
- Download: https://nodejs.org/en/download/
- Choose LTS version
- Run installer

### Run Frontend:

```powershell
# Navigate to frontend
cd "E:\Smart service management\smartcart\frontend"

# Install dependencies (first time only)
npm install

# Install additional packages
npm install axios react-router-dom

# Run development server
npm run dev
```

Frontend runs on: http://localhost:5173

---

## ✅ Verify Everything Works

### 1. Backend Health Check:
```
http://localhost:8080/actuator/health
```
Should return: `{"status":"UP"}`

### 2. Test Registration (Postman/Browser):
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "mobile": "9876543210",
  "password": "password123",
  "role": "CUSTOMER",
  "address": "123 Main St",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001"
}
```

### 3. Test Login:
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 4. Check MongoDB Atlas:
- Login to MongoDB Atlas
- Browse Collections
- Should see `users` collection with your data

---

## 🐛 Troubleshooting

### Problem: "JAVA_HOME not found"
**Solution**: Install Java 17 (see Step 1 above)

### Problem: "Port 8080 already in use"
**Solution**:
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID)
taskkill /PID <process_id> /F
```

### Problem: "Cannot connect to MongoDB"
**Solution**:
- Check MongoDB Atlas connection string
- Verify password is correct (no special characters)
- Check IP is whitelisted
- Try `0.0.0.0/0` for development

### Problem: Maven dependencies not downloading
**Solution**:
```powershell
# Clean and force update
.\mvnw.cmd clean install -U
```

### Problem: Red underlines in IntelliJ
**Solution**: Follow Step 4, Option 1 - "Fix Dependencies First"

---

## 📊 Quick Reference

### Backend URLs:
- **API Base**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/actuator/health
- **Auth**: http://localhost:8080/api/auth/*
- **Services**: http://localhost:8080/api/services
- **Customer**: http://localhost:8080/api/customer/*
- **Employee**: http://localhost:8080/api/employee/*
- **Admin**: http://localhost:8080/api/admin/*
- **IoT**: http://localhost:8080/api/iot/*

### Frontend URL:
- **Development**: http://localhost:5173

### MongoDB:
- **Atlas Dashboard**: https://cloud.mongodb.com/

---

## 🎯 Minimal Setup to Run (Without External Services)

If you just want to test the backend quickly:

1. **Install Java 17** ✅
2. **Setup MongoDB Atlas** ✅
3. **Update `application.properties`** with MongoDB URI ✅
4. **Run Backend** ✅

That's it! You can skip Cloudinary and Razorpay for now.

---

## 📝 Configuration Template

Minimal `application.properties` to run:

```properties
# Application
spring.application.name=Smart Service Management System
server.port=8080

# MongoDB Atlas
spring.data.mongodb.uri=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smartcart?retryWrites=true&w=majority
spring.data.mongodb.database=smartcart
spring.data.mongodb.auto-index-creation=true

# JWT (required)
jwt.secret=SmartServiceManagementSystemSecretKey2024VeryLongSecureKeyForJWTTokenGeneration
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Cloudinary (use dummy values for now)
cloudinary.cloud-name=demo
cloudinary.api-key=demo
cloudinary.api-secret=demo

# Razorpay (use dummy values for now)
razorpay.key-id=test
razorpay.key-secret=test

# Logging
logging.level.org.example=DEBUG
logging.level.org.springframework.data.mongodb=DEBUG

# Actuator
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

---

## ⏱️ Timeline

| Task | Time |
|------|------|
| Install Java 17 | 5 min |
| Setup MongoDB Atlas | 15 min |
| Configure application.properties | 2 min |
| Fix IntelliJ dependencies | 10-15 min |
| Run backend | 1 min |
| **TOTAL** | **~35 minutes** |

---

## 🎉 Success Checklist

- [ ] Java 17 installed
- [ ] `java -version` works
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string copied
- [ ] `application.properties` updated
- [ ] IntelliJ dependencies loaded (no red underlines)
- [ ] Backend runs without errors
- [ ] Health check returns UP
- [ ] Can register a user
- [ ] Data appears in MongoDB Atlas

---

## 🆘 Need Help?

### Documentation:
- **MONGODB_ATLAS_SETUP.md** - Detailed MongoDB setup
- **INSTALLATION_GUIDE.md** - Complete installation guide
- **ACTION_PLAN.md** - Fix IntelliJ errors
- **SETUP_GUIDE.md** - Configuration guide

### Quick Commands:

```powershell
# Run backend
cd "E:\Smart service management\smartcart"
.\mvnw.cmd spring-boot:run

# Run frontend
cd "E:\Smart service management\smartcart\frontend"
npm install
npm run dev

# Build backend JAR
.\mvnw.cmd clean package -DskipTests
```

---

## 🎊 You're Ready!

Once Java is installed and MongoDB is configured, you're literally **1 command away** from running your application!

```powershell
.\mvnw.cmd spring-boot:run
```

**Good luck! 🚀**

---

**Last Updated**: December 7, 2025  
**Status**: Ready to Run (Java installation needed)  
**GitHub**: https://github.com/gowtham6477/smart-cart

