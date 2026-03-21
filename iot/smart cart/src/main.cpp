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
const char* SERVER_URL = "http://10.145.126.138:8080";  // <-- Change to your server IP

// Device ID (unique for each ESP32)
const char* DEVICE_ID = "ESP32-001";  // <-- Change for each device

// ============================================
// PIN CONFIGURATION
// ============================================
#define SDA_PIN 21
#define SCL_PIN 22
#define LED_PIN 2

// ============================================
// DETECTION THRESHOLDS
// ============================================
const float FALL_THRESHOLD = 2.5;       // g-force for fall detection
const float IMPACT_THRESHOLD = 3.5;     // g-force for impact detection
const float VIBRATION_THRESHOLD = 0.8;  // variance for vibration

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
float previousMagnitude = 1.0;
float variance;

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
    mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_4);
    mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_500);
  } else {
    Serial.println("✓ MPU6050 found, configuring...");
    mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_4);
    mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_500);
  }
  
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
  
  // ===== FALL DETECTION =====
  if (magnitude > FALL_THRESHOLD && magnitude < IMPACT_THRESHOLD) {
    if (currentTime - lastFallEvent > EVENT_COOLDOWN) {
      Serial.println("\n🚨 ========== FALL DETECTED! ==========");
      Serial.printf("    Magnitude: %.2f g\n", magnitude);
      Serial.println("    =====================================\n");
      
      sendEvent("FALL", "HIGH", "Product fall detected during delivery");
      lastFallEvent = currentTime;
      blinkLED(5, 100);
    }
  }
  
  // ===== IMPACT DETECTION =====
  if (magnitude > IMPACT_THRESHOLD) {
    if (currentTime - lastImpactEvent > EVENT_COOLDOWN) {
      Serial.println("\n🔴 ======= CRITICAL IMPACT! ==========");
      Serial.printf("    Magnitude: %.2f g\n", magnitude);
      Serial.println("    =====================================\n");
      
      sendEvent("IMPACT", "CRITICAL", "Severe impact detected - package may be damaged");
      lastImpactEvent = currentTime;
      blinkLED(10, 50);
    }
  }
  
  // Send heartbeat periodically
  if (currentTime - lastHeartbeat > HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = currentTime;
  }
  
  // Print sensor data every second
  if (currentTime - lastPrintTime > 1000) {
    Serial.printf("Mag: %.2fg | Var: %.3f | WiFi: %s\n",
                  magnitude, variance, 
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
  sensorData["accelerometerX"] = ax;
  sensorData["accelerometerY"] = ay;
  sensorData["accelerometerZ"] = az;
  sensorData["gyroscopeX"] = gx;
  sensorData["gyroscopeY"] = gy;
  sensorData["gyroscopeZ"] = gz;
  
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