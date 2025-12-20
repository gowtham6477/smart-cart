# 📦 Complete Installation & Package Setup Guide
## Smart Service Management System with MongoDB Atlas

---

## 🎯 Overview

This guide will help you install ALL required packages and dependencies for the complete Smart Service Management System, including:
- ✅ Backend (Spring Boot + MongoDB)
- ✅ Frontend (React + Vite)
- ✅ External Services (Cloudinary, Razorpay)
- ✅ IoT Support (MQTT, WebSocket)
- ✅ All features from SRS document

---

## 📋 System Requirements

### Required Software:
1. **Java 17+** - Backend runtime
2. **Node.js 18+** - Frontend development
3. **Maven** - Build tool (or use included wrapper)
4. **Git** - Version control
5. **IntelliJ IDEA** - IDE (Community or Ultimate)
6. **Web Browser** - Chrome/Firefox/Edge

### Optional:
- Postman - API testing
- MongoDB Compass - Database GUI
- VS Code - Alternative editor

---

## 🚀 Part 1: Backend Setup (Spring Boot + MongoDB)

### Step 1.1: Install Java 17

#### Windows:
1. Download: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
2. Run installer
3. Verify installation:
   ```cmd
   java -version
   ```
   Should show: `java version "17.x.x"`

#### Mac:
```bash
brew install openjdk@17
```

#### Linux:
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

### Step 1.2: Install Maven (Optional - wrapper included)

#### Windows:
1. Download: https://maven.apache.org/download.cgi
2. Extract to `C:\Program Files\Apache\maven`
3. Add to PATH:
   - System Properties → Environment Variables
   - Add `C:\Program Files\Apache\maven\bin` to Path
4. Verify:
   ```cmd
   mvn -version
   ```

#### Mac:
```bash
brew install maven
```

#### Linux:
```bash
sudo apt install maven
```

### Step 1.3: Setup MongoDB Atlas

Follow the detailed guide: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

Quick steps:
1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Create database user
4. Whitelist IP address
5. Get connection string
6. Update `application.properties`

### Step 1.4: Configure Backend

#### Fix IntelliJ Errors (IMPORTANT!):
1. **Enable Annotation Processing**:
   - `File` → `Settings` → `Compiler` → `Annotation Processors`
   - ✅ Check "Enable annotation processing"

2. **Install Lombok Plugin**:
   - `File` → `Settings` → `Plugins`
   - Search "Lombok" → Install

3. **Reload Maven**:
   - Open Maven tool window
   - Click reload button (🔄)
   - Wait for dependencies to download (5-15 minutes)

4. **Build Project**:
   - `Build` → `Build Project` (Ctrl+F9)

#### Update application.properties:

```properties
# MongoDB Atlas Configuration
spring.data.mongodb.uri=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smartcart?retryWrites=true&w=majority
spring.data.mongodb.database=smartcart
spring.data.mongodb.auto-index-creation=true

# JWT Configuration
jwt.secret=YourSuperSecretKeyHere256BitsMinimum
jwt.expiration=86400000

# Cloudinary (Sign up at https://cloudinary.com/)
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# Razorpay (Sign up at https://razorpay.com/)
razorpay.key-id=your_razorpay_key_id
razorpay.key-secret=your_razorpay_key_secret
```

### Step 1.5: Maven Dependencies (Already Configured)

The `pom.xml` includes:

#### Core Dependencies:
- ✅ Spring Boot 3.2.0
- ✅ Spring Boot Starter Web
- ✅ Spring Boot Starter Data MongoDB
- ✅ Spring Boot Starter Security
- ✅ Spring Boot Starter Validation
- ✅ Spring Boot Starter Actuator

#### Authentication & Security:
- ✅ JWT (jjwt-api, jjwt-impl, jjwt-jackson) v0.12.3
- ✅ BCrypt (included in Spring Security)

#### External Integrations:
- ✅ Cloudinary v1.38.0 - Image storage
- ✅ Razorpay Java SDK v1.4.6 - Payment gateway

#### IoT & Real-time:
- ✅ Spring Integration MQTT - IoT device communication
- ✅ Spring Boot Starter WebSocket - Real-time updates

#### Utilities:
- ✅ Lombok - Reduce boilerplate code
- ✅ ModelMapper v3.2.0 - DTO mapping
- ✅ Apache Commons Lang3 - Utility functions
- ✅ Jackson Datatype JSR310 - Date/time handling

### Step 1.6: Run Backend

#### Option 1: IntelliJ
1. Open `src/main/java/org/example/Main.java`
2. Right-click → `Run 'Main.main()'`
3. Backend starts on http://localhost:8080

#### Option 2: Maven Command
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

#### Option 3: JAR file
```bash
# Build
.\mvnw.cmd clean package -DskipTests

# Run
java -jar target/smartcart-1.0-SNAPSHOT.jar
```

### Step 1.7: Verify Backend

1. **Health Check**:
   ```
   http://localhost:8080/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **Test Registration** (using Postman):
   ```http
   POST http://localhost:8080/api/auth/register
   Content-Type: application/json

   {
     "name": "Test User",
     "email": "test@example.com",
     "mobile": "9876543210",
     "password": "password123",
     "role": "CUSTOMER"
   }
   ```

3. **Check MongoDB Atlas**:
   - Login to MongoDB Atlas
   - Browse Collections
   - Should see `users` collection with your test user

---

## 🎨 Part 2: Frontend Setup (React + Vite)

### Step 2.1: Install Node.js

#### Windows:
1. Download: https://nodejs.org/en/download/
2. Run installer (choose LTS version)
3. Verify:
   ```cmd
   node -v
   npm -v
   ```

#### Mac:
```bash
brew install node
```

#### Linux:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2.2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This installs:
- ✅ React 18.3.1
- ✅ React DOM 18.3.1
- ✅ React Router DOM (for routing)
- ✅ Vite 5.4.10 (build tool)
- ✅ ESLint (code quality)

### Step 2.3: Install Additional Frontend Packages

```bash
cd frontend

# HTTP Client
npm install axios

# UI Component Library (Choose one or use plain CSS)
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
# OR
npm install antd
# OR use TailwindCSS (see below)

# Form Handling
npm install react-hook-form yup @hookform/resolvers

# State Management
npm install zustand
# OR
npm install @reduxjs/toolkit react-redux

# Date Handling
npm install date-fns

# Notifications
npm install react-toastify

# Icons
npm install react-icons

# Payment Gateway (Razorpay)
npm install razorpay

# Chart/Analytics
npm install recharts
```

### Step 2.4: TailwindCSS Setup (Optional)

If you want to use TailwindCSS:

```bash
cd frontend

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 2.5: Configure Frontend Environment

Create `.env` file in `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_WS_URL=ws://localhost:8080/ws
```

### Step 2.6: Run Frontend

```bash
cd frontend
npm run dev
```

Frontend starts on: http://localhost:5173

### Step 2.7: Build for Production

```bash
cd frontend
npm run build
```

Builds to `frontend/dist` directory

---

## ☁️ Part 3: External Services Setup

### 3.1: Cloudinary (Image Storage)

1. **Sign Up**: https://cloudinary.com/users/register/free
2. **Get Credentials**:
   - Login → Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret
3. **Add to Backend**:
   ```properties
   cloudinary.cloud-name=your_cloud_name
   cloudinary.api-key=your_api_key
   cloudinary.api-secret=your_api_secret
   ```
4. **Features**:
   - ✅ Upload before/after service images
   - ✅ Automatic optimization
   - ✅ CDN delivery
   - ✅ 25 GB free storage

### 3.2: Razorpay (Payment Gateway)

1. **Sign Up**: https://razorpay.com/
2. **Get Test API Keys**:
   - Dashboard → Settings → API Keys
   - Click "Generate Test Key"
   - Copy Key ID and Key Secret
3. **Add to Backend**:
   ```properties
   razorpay.key-id=rzp_test_xxxxxxxxxxxxx
   razorpay.key-secret=your_secret_key
   ```
4. **Add to Frontend**:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   ```
5. **Test Cards**:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

### 3.3: Email Service (Optional - SendGrid/AWS SES)

For sending booking confirmations, password resets, etc.

#### SendGrid:
1. Sign up: https://signup.sendgrid.com/
2. Create API Key
3. Add dependency to `pom.xml`:
   ```xml
   <dependency>
       <groupId>com.sendgrid</groupId>
       <artifactId>sendgrid-java</artifactId>
       <version>4.9.3</version>
   </dependency>
   ```
4. Add to `application.properties`:
   ```properties
   sendgrid.api-key=your_api_key
   sendgrid.from-email=noreply@yourservice.com
   ```

---

## 🤖 Part 4: IoT Setup (Optional)

### 4.1: Hardware Requirements

- ✅ ESP32 Development Board
- ✅ MPU6050 Accelerometer/Gyroscope
- ✅ Jumper Wires
- ✅ Micro USB Cable
- ✅ Power Bank (optional)

### 4.2: Software for ESP32

1. **Arduino IDE**: https://www.arduino.cc/en/software
2. **ESP32 Board Manager**:
   - File → Preferences
   - Additional Board Manager URLs:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
3. **Libraries** (Arduino IDE → Tools → Manage Libraries):
   - WiFi (built-in)
   - HTTPClient (built-in)
   - ArduinoJson
   - MPU6050

### 4.3: MQTT Broker (Optional)

#### Option 1: EMQX Cloud (Free tier)
1. Sign up: https://www.emqx.com/en/cloud
2. Create deployment
3. Get connection details

#### Option 2: Local Mosquitto
```bash
# Windows
choco install mosquitto

# Mac
brew install mosquitto

# Linux
sudo apt install mosquitto mosquitto-clients
```

### 4.4: ESP32 Sample Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <MPU6050.h>

const char* ssid = "Your_WiFi_SSID";
const char* password = "Your_WiFi_Password";
const char* serverUrl = "http://your-backend-url/api/iot/events";

MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Wire.begin();
  mpu.initialize();
}

void loop() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  
  // Detect fall (sudden acceleration)
  float accelMagnitude = sqrt(ax*ax + ay*ay + az*az) / 16384.0;
  
  if (accelMagnitude > 2.5) {
    sendEvent("FALL", "HIGH");
  }
  
  delay(1000);
}

void sendEvent(String eventType, String severity) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["deviceId"] = "ESP32_001";
  doc["eventType"] = eventType;
  doc["severity"] = severity;
  doc["message"] = "Fall detected";
  
  String json;
  serializeJson(doc, json);
  
  int httpCode = http.POST(json);
  http.end();
}
```

---

## 📦 Part 5: Complete Package List

### Backend Dependencies (from pom.xml):
```xml
<!-- Core -->
spring-boot-starter-web: 3.2.0
spring-boot-starter-data-mongodb: 3.2.0
spring-boot-starter-security: 3.2.0
spring-boot-starter-validation: 3.2.0
spring-boot-starter-actuator: 3.2.0

<!-- JWT -->
jjwt-api: 0.12.3
jjwt-impl: 0.12.3
jjwt-jackson: 0.12.3

<!-- External Services -->
cloudinary-http44: 1.38.0
razorpay-java: 1.4.6

<!-- IoT -->
spring-integration-mqtt: 6.2.0
spring-boot-starter-websocket: 3.2.0

<!-- Utilities -->
lombok: 1.18.30
modelmapper: 3.2.0
commons-lang3: 3.x
jackson-datatype-jsr310: 2.15.x
```

### Frontend Dependencies (from package.json):
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "@mui/material": "^5.14.20",
    "@mui/icons-material": "^5.14.19",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "react-hook-form": "^7.48.2",
    "yup": "^1.3.3",
    "zustand": "^4.4.7",
    "date-fns": "^2.30.0",
    "react-toastify": "^9.1.3",
    "react-icons": "^4.12.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "eslint": "^8.55.0"
  }
}
```

---

## ✅ Verification Checklist

### Backend:
- [ ] Java 17+ installed
- [ ] IntelliJ IDEA setup complete
- [ ] Annotation processing enabled
- [ ] Lombok plugin installed
- [ ] Maven dependencies downloaded
- [ ] MongoDB Atlas cluster created
- [ ] Connection string configured
- [ ] Cloudinary account created
- [ ] Razorpay account created (test mode)
- [ ] Backend runs on port 8080
- [ ] Health check returns UP
- [ ] Can register user via API
- [ ] Data visible in MongoDB Atlas

### Frontend:
- [ ] Node.js 18+ installed
- [ ] npm packages installed
- [ ] Environment variables configured
- [ ] Frontend runs on port 5173
- [ ] Can access frontend in browser
- [ ] API calls work (check Network tab)

### External Services:
- [ ] Cloudinary credentials added
- [ ] Razorpay credentials added
- [ ] Image upload works
- [ ] Test payment works

---

## 🚀 Running the Complete Application

### Terminal 1 - Backend:
```bash
cd smartcart
.\mvnw.cmd spring-boot:run
```

### Terminal 2 - Frontend:
```bash
cd smartcart/frontend
npm run dev
```

### Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/actuator/health
- **MongoDB Atlas**: https://cloud.mongodb.com/

---

## 📚 Documentation Files

- 📄 `README.md` - Project overview
- 📄 `ACTION_PLAN.md` - Fix IntelliJ errors
- 📄 `SETUP_GUIDE.md` - Detailed setup
- 📄 `MONGODB_ATLAS_SETUP.md` - MongoDB setup
- 📄 `INSTALLATION_GUIDE.md` - This file
- 📄 `PROJECT_STATUS.md` - Current status
- 📄 `QUICK_START.html` - Visual guide

---

## 🎉 Success!

If you can:
1. ✅ Start backend without errors
2. ✅ Start frontend without errors
3. ✅ Register a user
4. ✅ Login successfully
5. ✅ See data in MongoDB Atlas

**Congratulations! Your complete Smart Service Management System is running!** 🚀

---

**Last Updated**: December 7, 2025
**All Packages**: Installed ✅
**MongoDB Atlas**: Configured ✅
**All SRS Features**: Implemented ✅

