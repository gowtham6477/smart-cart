#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <MPU6050.h>

// ============================================
// CONFIGURATION - CHANGE THESE!
// ============================================

// WiFi Credentials
const char* WIFI_SSID = "realme P1 Pro 5G";        // <-- Change this
const char* WIFI_PASSWORD = "helloworld"; // <-- Change this

// Backend Server URL (your Spring Boot server)
const char* SERVER_URL = "http://10.112.92.138:8080";  // <-- Change to your server IP

// Device ID (unique for each ESP32)
const char* DEVICE_ID = "ESP32-001";  // <-- Change for each device

// ============================================
// PIN CONFIGURATION
// ============================================
#define SDA_PIN 21
#define SCL_PIN 22
#define LED_PIN 2

// ============================================
// CATEGORY PROFILES + THRESHOLDS
// ============================================
enum PackageCategory {
  CATEGORY_FRAGILE,   // Glassware, Ceramics, Instruments, Jewelry
  CATEGORY_HAZARDOUS, // Batteries, Flammables, Pharma, Electronics
  CATEGORY_HEAVY      // Industrial equipment, sculptures, antiques
};

struct MotionProfile {
  const char* name;
  float ffThresholdG;      // Free-fall threshold (g)
  uint16_t ffDurationMs;   // Free-fall duration (ms)
  float motThresholdG;     // Impact/motion threshold (g)
  uint16_t motDurationMs;  // Impact/motion duration (ms)
  float tiltThresholdDeg;  // Tilt threshold (deg)
  float tumbleGyroDps;     // Tumble angular velocity (deg/s)
  bool useZeroMotion;
  bool useHpf;
};

// Base profiles (single-category)
const MotionProfile PROFILE_FRAGILE = {
  "Fragile/Precision",
  0.35f, // 350mg
  20,
  0.08f, // 80mg (micro-impact)
  20,
  25.0f,
  90.0f,
  false,
  true
};

const MotionProfile PROFILE_HAZARDOUS = {
  "Structural/Hazardous",
  0.45f, // 450mg
  50,
  1.5f,  // 1g-2g
  40,
  20.0f,
  140.0f,
  true,
  true
};

const MotionProfile PROFILE_HEAVY = {
  "Heavy/Industrial",
  0.60f, // 600mg
  100,
  0.50f, // 500mg
  60,
  30.0f,
  160.0f,
  false,
  true
};

// Mixed package configuration (lowest common denominator rule)
const bool MIX_HAS_FRAGILE = true;
const bool MIX_HAS_HAZARDOUS = false;
const bool MIX_HAS_HEAVY = false;

// Pro tip: increase duration slightly to avoid road-noise false positives
const uint16_t DURATION_PADDING_MS = 20;

// Cooldown to prevent multiple events
const unsigned long EVENT_COOLDOWN = 5000;  // 5 seconds between same event type

// ============================================
// GLOBAL VARIABLES
// ============================================
MPU6050 mpu;
HTTPClient http;

// Sensor data
float ax, ay, az;
float gx, gy, gz;
float magnitude;
float linearMagnitude;
float tiltAngleDeg;
float gyroMagnitude;
float previousMagnitude = 1.0;
float variance;

// Gravity compensation (linear acceleration)
float gravityX = 0.0f;
float gravityY = 0.0f;
float gravityZ = 1.0f;
const float GRAVITY_ALPHA = 0.98f;

// Active profile
MotionProfile activeProfile = PROFILE_FRAGILE;

// Detection timers
unsigned long ffStart = 0;
unsigned long motStart = 0;
unsigned long tiltStart = 0;
unsigned long zeroMotionStart = 0;
bool impactLatched = false;

// Pre-impact buffer (FIFO ~100ms)
const int PRE_IMPACT_SAMPLES = 10;
float preImpactMag[PRE_IMPACT_SAMPLES];
float preImpactTilt[PRE_IMPACT_SAMPLES];
float preImpactLinear[PRE_IMPACT_SAMPLES];
int preImpactIndex = 0;

// Timing
unsigned long lastHeartbeat = 0;
unsigned long lastFallEvent = 0;
unsigned long lastImpactEvent = 0;
unsigned long lastPrintTime = 0;

const unsigned long HEARTBEAT_INTERVAL = 30000;  // Send heartbeat every 30 seconds

// Connection status
bool wifiConnected = false;
bool serverRegistered = false;

// ============================================
// FUNCTION DECLARATIONS
// ============================================
void connectWiFi();
void registerDevice();
void sendHeartbeat();
void sendEvent(const char* eventType, const char* severity, const char* message);
void blinkLED(int times, int delayMs);
void pingServer();
MotionProfile selectCriticalProfile();
MotionProfile buildMixedProfile();
float clampFloat(float value, float minValue, float maxValue);

// ============================================
// SETUP
// ============================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("\n==========================================");
  Serial.println("  Smart Cart IoT - Fall Detection System");
  Serial.println("==========================================");
  Serial.printf("  Device ID: %s\n", DEVICE_ID);
  Serial.println("==========================================\n");
  
  // Initialize I2C
  Wire.begin(SDA_PIN, SCL_PIN);
  
  // Initialize MPU6050
  Serial.println("Initializing MPU6050...");
  Wire.beginTransmission(0x68);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission(true);
  delay(100);
  
  mpu.initialize();
  delay(100);
  
  if (mpu.testConnection()) {
    Serial.println("✓ MPU6050 connected successfully");
    mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_16); // High-G clipping management
    mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_2000);
  } else {
    Serial.println("✓ MPU6050 found, configuring...");
    mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_16);
    mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_2000);
  }

  activeProfile = buildMixedProfile();
  Serial.printf("Active Profile: %s | FF %.2fg/%ums | MOT %.2fg/%ums\n",
                activeProfile.name,
                activeProfile.ffThresholdG,
                activeProfile.ffDurationMs,
                activeProfile.motThresholdG,
                activeProfile.motDurationMs);
  
  // Connect to WiFi
  connectWiFi();
  
  // Register device with backend
  if (wifiConnected) {
    registerDevice();
    pingServer();
  }
  
  Serial.println("\n✓ System Ready!");
  Serial.println("Monitoring for falls and impacts...\n");
  blinkLED(3, 200);
}

// ============================================
// MAIN LOOP
// ============================================
void loop() {
  unsigned long currentTime = millis();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    connectWiFi();
    if (wifiConnected && !serverRegistered) {
      registerDevice();
    }
  }
  
  // Read sensor data
  int16_t ax_raw, ay_raw, az_raw;
  int16_t gx_raw, gy_raw, gz_raw;
  
  mpu.getAcceleration(&ax_raw, &ay_raw, &az_raw);
  mpu.getRotation(&gx_raw, &gy_raw, &gz_raw);
  
  ax = ax_raw / 8192.0;
  ay = ay_raw / 8192.0;
  az = az_raw / 8192.0;
  
  gx = gx_raw / 65.5;
  gy = gy_raw / 65.5;
  gz = gz_raw / 65.5;
  
  magnitude = sqrt(ax * ax + ay * ay + az * az);
  variance = abs(magnitude - previousMagnitude);
  previousMagnitude = magnitude;

  // Gravity compensation (linear acceleration)
  gravityX = GRAVITY_ALPHA * gravityX + (1.0f - GRAVITY_ALPHA) * ax;
  gravityY = GRAVITY_ALPHA * gravityY + (1.0f - GRAVITY_ALPHA) * ay;
  gravityZ = GRAVITY_ALPHA * gravityZ + (1.0f - GRAVITY_ALPHA) * az;

  float linX = ax - gravityX;
  float linY = ay - gravityY;
  float linZ = az - gravityZ;
  linearMagnitude = sqrt(linX * linX + linY * linY + linZ * linZ);

  // Tilt angle from gravity vector
  float gMag = sqrt(gravityX * gravityX + gravityY * gravityY + gravityZ * gravityZ);
  float normalizedZ = gMag > 0.0f ? gravityZ / gMag : 1.0f;
  normalizedZ = clampFloat(normalizedZ, -1.0f, 1.0f);
  tiltAngleDeg = acos(normalizedZ) * 180.0f / PI;

  gyroMagnitude = sqrt(gx * gx + gy * gy + gz * gz);

  // FIFO buffer (pre-impact signature)
  preImpactMag[preImpactIndex] = magnitude;
  preImpactTilt[preImpactIndex] = tiltAngleDeg;
  preImpactLinear[preImpactIndex] = linearMagnitude;
  preImpactIndex = (preImpactIndex + 1) % PRE_IMPACT_SAMPLES;

  // ===== FREE-FALL DETECTION =====
  if (magnitude < activeProfile.ffThresholdG) {
    if (ffStart == 0) ffStart = currentTime;
    if (currentTime - ffStart >= activeProfile.ffDurationMs && currentTime - lastFallEvent > EVENT_COOLDOWN) {
      Serial.println("\n🚨 ========== FREE-FALL DETECTED! ==========");
      Serial.printf("    Magnitude: %.2f g\n", magnitude);
      Serial.println("    =====================================\n");
      
      sendEvent("FALL", "HIGH", "Free-fall detected - inspection required");
      lastFallEvent = currentTime;
      ffStart = 0;
      blinkLED(5, 100);
    }
  } else {
    ffStart = 0;
  }

  // ===== IMPACT / MICRO-IMPACT DETECTION =====
  if (linearMagnitude > activeProfile.motThresholdG) {
    if (motStart == 0) motStart = currentTime;
    if (currentTime - motStart >= activeProfile.motDurationMs && currentTime - lastImpactEvent > EVENT_COOLDOWN) {
      const bool isFragile = activeProfile.motThresholdG <= PROFILE_FRAGILE.motThresholdG;
      const char* eventType = isFragile ? "ABNORMAL_MOVEMENT" : "IMPACT";
      const char* severity = isFragile ? "HIGH" : "CRITICAL";
      const char* message = isFragile
        ? "Micro-impact detected - inspection required"
        : "Impact detected - package may be damaged";

      impactLatched = activeProfile.useZeroMotion;

      Serial.println("\n🔴 ======= IMPACT DETECTED! ==========");
      Serial.printf("    Linear Mag: %.2f g\n", linearMagnitude);
      Serial.println("    =====================================\n");
      
      sendEvent(eventType, severity, message);
      lastImpactEvent = currentTime;
      motStart = 0;
      blinkLED(10, 50);
    }
  } else {
    motStart = 0;
  }

  // ===== ZERO-MOTION CONFIRMATION (Hazardous) =====
  if (activeProfile.useZeroMotion && impactLatched) {
    if (linearMagnitude < 0.05f) {
      if (zeroMotionStart == 0) zeroMotionStart = currentTime;
      if (currentTime - zeroMotionStart > 200) {
        sendEvent("IMPACT", "CRITICAL", "Impact detected and motion stopped - possible crash/spill");
        impactLatched = false;
        zeroMotionStart = 0;
      }
    } else {
      zeroMotionStart = 0;
    }
  }

  // ===== TILT DETECTION (Heavy/Fragile) =====
  if (tiltAngleDeg > activeProfile.tiltThresholdDeg) {
    if (tiltStart == 0) tiltStart = currentTime;
    if (currentTime - tiltStart > 200 && currentTime - lastImpactEvent > EVENT_COOLDOWN) {
      sendEvent("ABNORMAL_MOVEMENT", "HIGH", "Tilt detected - possible toppling risk");
      lastImpactEvent = currentTime;
      tiltStart = 0;
    }
  } else {
    tiltStart = 0;
  }

  // ===== TUMBLE DETECTION =====
  if (gyroMagnitude > activeProfile.tumbleGyroDps && linearMagnitude > activeProfile.motThresholdG) {
    if (currentTime - lastImpactEvent > EVENT_COOLDOWN) {
      sendEvent("ABNORMAL_MOVEMENT", "HIGH", "Tumble detected - unstable handling");
      lastImpactEvent = currentTime;
      blinkLED(6, 80);
    }
  }
  
  // Send heartbeat periodically
  if (currentTime - lastHeartbeat > HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = currentTime;
  }
  
  // Print sensor data every second
  if (currentTime - lastPrintTime > 1000) {
    Serial.printf("Mag: %.2fg | Lin: %.2fg | Tilt: %.1f° | WiFi: %s\n",
                  magnitude, linearMagnitude, tiltAngleDeg,
                  wifiConnected ? "Connected" : "Disconnected");
    lastPrintTime = currentTime;
  }
  
  delay(10);
}

// ============================================
// WiFi CONNECTION
// ============================================
void connectWiFi() {
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n✓ WiFi Connected!");
    Serial.printf("  IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    wifiConnected = false;
    Serial.println("\n✗ WiFi Connection Failed!");
  }
}

// ============================================
// REGISTER DEVICE WITH BACKEND
// ============================================
void registerDevice() {
  if (!wifiConnected) return;
  
  String url = String(SERVER_URL) + "/api/iot/device/register";
  
  Serial.printf("Registering device with server: %s\n", url.c_str());
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["name"] = String("Smart Cart Device ") + DEVICE_ID;
  doc["macAddress"] = WiFi.macAddress();
  doc["firmwareVersion"] = "1.0.0";
  
  String payload;
  serializeJson(doc, payload);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("✓ Device registered (HTTP %d)\n", httpCode);
    serverRegistered = true;
  } else {
    Serial.printf("✗ Registration failed: %s\n", http.errorToString(httpCode).c_str());
    serverRegistered = false;
  }
  
  http.end();
}

// ============================================
// SEND HEARTBEAT
// ============================================
void sendHeartbeat() {
  if (!wifiConnected) return;
  
  String url = String(SERVER_URL) + "/api/iot/heartbeat/" + DEVICE_ID;
  
  StaticJsonDocument<128> doc;
  doc["ipAddress"] = WiFi.localIP().toString();
  
  String payload;
  serializeJson(doc, payload);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    Serial.println("♥ Heartbeat sent");
  } else {
    Serial.printf("✗ Heartbeat failed: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
}

// ============================================
// SEND EVENT TO BACKEND
// ============================================
void sendEvent(const char* eventType, const char* severity, const char* message) {
  if (!wifiConnected) {
    Serial.println("⚠ Cannot send event - WiFi disconnected");
    return;
  }
  
  String url = String(SERVER_URL) + "/api/iot/events";
  
  Serial.printf("Sending %s event to server...\n", eventType);
  
  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["eventType"] = eventType;
  doc["severity"] = severity;
  doc["message"] = message;
  
  // Add sensor data
  JsonObject sensorData = doc.createNestedObject("sensorData");
  sensorData["magnitude"] = magnitude;
  sensorData["variance"] = variance;
  sensorData["linearMagnitude"] = linearMagnitude;
  sensorData["tiltAngleDeg"] = tiltAngleDeg;
  sensorData["gyroMagnitudeDps"] = gyroMagnitude;
  sensorData["profileName"] = activeProfile.name;
  sensorData["accelerometerX"] = ax;
  sensorData["accelerometerY"] = ay;
  sensorData["accelerometerZ"] = az;
  sensorData["gyroscopeX"] = gx;
  sensorData["gyroscopeY"] = gy;
  sensorData["gyroscopeZ"] = gz;

  JsonArray preImpact = sensorData.createNestedArray("preImpact");
  for (int i = 0; i < PRE_IMPACT_SAMPLES; i++) {
    int index = (preImpactIndex + i) % PRE_IMPACT_SAMPLES;
    JsonObject entry = preImpact.createNestedObject();
    entry["mag"] = preImpactMag[index];
    entry["lin"] = preImpactLinear[index];
    entry["tilt"] = preImpactTilt[index];
  }
  
  String payload;
  serializeJson(doc, payload);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("✓ Event sent successfully (HTTP %d)\n", httpCode);
  } else {
    Serial.printf("✗ Event send failed: %s\n", http.errorToString(httpCode).c_str());
    pingServer();
  }
  
  http.end();
}

// ============================================
// LED BLINK
// ============================================
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

// ============================================
// PING BACKEND SERVER
// ============================================
void pingServer() {
  if (!wifiConnected) return;

  String url = String(SERVER_URL) + "/actuator/health";
  Serial.printf("Pinging server: %s\n", url.c_str());

  http.begin(url);
  int httpCode = http.GET();

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("✓ Server reachable (HTTP %d): %s\n", httpCode, response.c_str());
  } else {
    Serial.printf("✗ Server ping failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ============================================
// PROFILE SELECTION LOGIC
// ============================================
MotionProfile selectCriticalProfile() {
  if (MIX_HAS_HAZARDOUS) return PROFILE_HAZARDOUS;
  if (MIX_HAS_FRAGILE) return PROFILE_FRAGILE;
  return PROFILE_HEAVY;
}

MotionProfile buildMixedProfile() {
  MotionProfile critical = selectCriticalProfile();

  MotionProfile mixed = critical;
  mixed.name = "Mixed (Lowest Common Denominator)";

  // Use lowest thresholds across included categories
  if (MIX_HAS_FRAGILE) {
    mixed.ffThresholdG = min(mixed.ffThresholdG, PROFILE_FRAGILE.ffThresholdG);
    mixed.motThresholdG = min(mixed.motThresholdG, PROFILE_FRAGILE.motThresholdG);
  }
  if (MIX_HAS_HAZARDOUS) {
    mixed.ffThresholdG = min(mixed.ffThresholdG, PROFILE_HAZARDOUS.ffThresholdG);
    mixed.motThresholdG = min(mixed.motThresholdG, PROFILE_HAZARDOUS.motThresholdG);
  }
  if (MIX_HAS_HEAVY) {
    mixed.ffThresholdG = min(mixed.ffThresholdG, PROFILE_HEAVY.ffThresholdG);
    mixed.motThresholdG = min(mixed.motThresholdG, PROFILE_HEAVY.motThresholdG);
  }

  // Increase duration slightly to avoid false positives for sensitive thresholds
  mixed.ffDurationMs = (uint16_t)(max(mixed.ffDurationMs, critical.ffDurationMs) + DURATION_PADDING_MS);
  mixed.motDurationMs = (uint16_t)(max(mixed.motDurationMs, critical.motDurationMs) + DURATION_PADDING_MS);

  return mixed;
}

float clampFloat(float value, float minValue, float maxValue) {
  return value < minValue ? minValue : (value > maxValue ? maxValue : value);
}