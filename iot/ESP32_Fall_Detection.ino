/**
 * Smart Service Management System - IoT Fall Detection
 * ESP32 + MPU6050 Fall Detection and Product Safety Monitoring
 *
 * Hardware: ESP32 DevKit + MPU6050 6-Axis IMU
 * Protocol: MQTT / HTTP
 *
 * Features:
 * - Real-time fall detection
 * - Impact monitoring
 * - Vibration analysis
 * - SOS button
 * - WiFi connectivity
 * - MQTT/HTTP data transmission
 */

#include <Wire.h>
#include <MPU6050.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ============================================
// CONFIGURATION
// ============================================

// WiFi Credentials
const char* WIFI_SSID = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

// Backend API Configuration
const char* API_BASE_URL = "http://your-backend-url:8080/api";
const char* IOT_EVENTS_ENDPOINT = "/iot/events";

// MQTT Configuration (Optional)
const char* MQTT_BROKER = "mqtt.your-broker.com";
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "smartcart/events";
const char* MQTT_CLIENT_ID = "ESP32_001";

// Device Configuration
const char* DEVICE_ID = "ESP32_001";
String BOOKING_ID = "";  // Set dynamically when device is paired with booking

// Sensor Thresholds
const float FALL_THRESHOLD = 2.5;      // g-force
const float IMPACT_THRESHOLD = 3.0;    // g-force
const float VIBRATION_THRESHOLD = 0.5; // variance
const int INACTIVITY_TIMEOUT = 1800000; // 30 minutes in ms

// Pin Configuration
const int SOS_BUTTON_PIN = 15;
const int LED_PIN = 2;

// ============================================
// GLOBAL OBJECTS
// ============================================

MPU6050 mpu;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
HTTPClient http;

// ============================================
// SENSOR DATA STRUCTURES
// ============================================

struct SensorData {
  float ax, ay, az;  // Accelerometer
  float gx, gy, gz;  // Gyroscope
  float magnitude;
  float variance;
  unsigned long timestamp;
};

SensorData currentData;
SensorData previousData;

// ============================================
// TIMING VARIABLES
// ============================================

unsigned long lastReadTime = 0;
unsigned long lastMovementTime = 0;
unsigned long lastTransmitTime = 0;

const int READ_INTERVAL = 10;       // 100Hz sampling rate
const int TRANSMIT_INTERVAL = 60000; // Send status every 60 seconds

// ============================================
// SETUP FUNCTION
// ============================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=================================");
  Serial.println("Smart Service Management - IoT Device");
  Serial.println("Fall Detection & Safety Monitor");
  Serial.println("=================================\n");

  // Initialize pins
  pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  blinkLED(3, 200);

  // Initialize I2C
  Wire.begin(21, 22); // SDA, SCL

  // Initialize MPU6050
  Serial.println("Initializing MPU6050...");
  mpu.initialize();

  if (mpu.testConnection()) {
    Serial.println("✓ MPU6050 connection successful");
    mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_4);
    mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_500);
  } else {
    Serial.println("✗ MPU6050 connection failed!");
    blinkLED(10, 100);
    ESP.restart();
  }

  // Connect to WiFi
  connectWiFi();

  // Connect to MQTT (optional)
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  connectMQTT();

  Serial.println("\n✓ System Ready!");
  Serial.println("Monitoring started...\n");
  blinkLED(2, 500);
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  unsigned long currentTime = millis();

  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Check MQTT connection (if using MQTT)
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  // Read sensor data at 100Hz
  if (currentTime - lastReadTime >= READ_INTERVAL) {
    readSensorData();
    analyzeSensorData();
    lastReadTime = currentTime;
  }

  // Check SOS button
  if (digitalRead(SOS_BUTTON_PIN) == LOW) {
    sendSOSAlert();
    delay(1000); // Debounce
  }

  // Check for inactivity
  if (currentTime - lastMovementTime > INACTIVITY_TIMEOUT) {
    sendInactivityAlert();
    lastMovementTime = currentTime;
  }

  // Send periodic status update
  if (currentTime - lastTransmitTime >= TRANSMIT_INTERVAL) {
    sendStatusUpdate();
    lastTransmitTime = currentTime;
  }

  delay(1);
}

// ============================================
// SENSOR FUNCTIONS
// ============================================

void readSensorData() {
  // Read raw sensor data
  int16_t ax_raw, ay_raw, az_raw;
  int16_t gx_raw, gy_raw, gz_raw;

  mpu.getAcceleration(&ax_raw, &ay_raw, &az_raw);
  mpu.getRotation(&gx_raw, &gy_raw, &gz_raw);

  // Convert to g-force and degrees/sec
  currentData.ax = ax_raw / 8192.0;  // ±4g range
  currentData.ay = ay_raw / 8192.0;
  currentData.az = az_raw / 8192.0;

  currentData.gx = gx_raw / 65.5;    // ±500°/s range
  currentData.gy = gy_raw / 65.5;
  currentData.gz = gz_raw / 65.5;

  // Calculate magnitude
  currentData.magnitude = sqrt(
    currentData.ax * currentData.ax +
    currentData.ay * currentData.ay +
    currentData.az * currentData.az
  );

  // Calculate variance (simple rolling variance)
  float diff = currentData.magnitude - previousData.magnitude;
  currentData.variance = abs(diff);

  currentData.timestamp = millis();
  previousData = currentData;
}

void analyzeSensorData() {
  // Detect movement for inactivity tracking
  if (currentData.magnitude > 0.5 || currentData.variance > 0.1) {
    lastMovementTime = millis();
  }

  // Fall Detection
  if (currentData.magnitude > FALL_THRESHOLD && currentData.magnitude < IMPACT_THRESHOLD) {
    Serial.println("\n⚠️  FALL DETECTED!");
    sendEvent("FALL", "Product fall detected", "HIGH");
    blinkLED(5, 100);
  }

  // Impact Detection
  if (currentData.magnitude > IMPACT_THRESHOLD) {
    Serial.println("\n🔴 CRITICAL IMPACT DETECTED!");
    sendEvent("IMPACT", "Severe impact detected", "CRITICAL");
    blinkLED(10, 50);
  }

  // Vibration Detection
  if (currentData.variance > VIBRATION_THRESHOLD) {
    Serial.println("\n⚡ ABNORMAL VIBRATION DETECTED!");
    sendEvent("VIBRATION", "Abnormal shaking detected", "MEDIUM");
    blinkLED(3, 150);
  }

  // Debug output (every second)
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 1000) {
    Serial.printf("Mag: %.2f | Var: %.2f | Ax: %.2f | Ay: %.2f | Az: %.2f\n",
                  currentData.magnitude, currentData.variance,
                  currentData.ax, currentData.ay, currentData.az);
    lastPrint = millis();
  }
}

// ============================================
// EVENT TRANSMISSION FUNCTIONS
// ============================================

void sendEvent(String eventType, String description, String severity) {
  // Prepare JSON payload
  StaticJsonDocument<512> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["bookingId"] = BOOKING_ID;
  doc["eventType"] = eventType;
  doc["description"] = description;
  doc["severity"] = severity;

  JsonObject accel = doc.createNestedObject("accelerometerData");
  accel["x"] = currentData.ax;
  accel["y"] = currentData.ay;
  accel["z"] = currentData.az;

  JsonObject gyro = doc.createNestedObject("gyroscopeData");
  gyro["x"] = currentData.gx;
  gyro["y"] = currentData.gy;
  gyro["z"] = currentData.gz;

  doc["magnitude"] = currentData.magnitude;
  doc["variance"] = currentData.variance;
  doc["timestamp"] = currentData.timestamp;

  String payload;
  serializeJson(doc, payload);

  // Send via HTTP
  sendHTTPEvent(payload);

  // Send via MQTT (optional)
  sendMQTTEvent(payload);
}

void sendHTTPEvent(String payload) {
  String url = String(API_BASE_URL) + String(IOT_EVENTS_ENDPOINT);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.printf("✓ HTTP Event sent: %d\n", httpCode);
    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("Response: " + response);
    }
  } else {
    Serial.printf("✗ HTTP Error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void sendMQTTEvent(String payload) {
  if (mqttClient.connected()) {
    if (mqttClient.publish(MQTT_TOPIC, payload.c_str())) {
      Serial.println("✓ MQTT Event published");
    } else {
      Serial.println("✗ MQTT Publish failed");
    }
  }
}

void sendSOSAlert() {
  Serial.println("\n🆘 SOS BUTTON PRESSED!");
  sendEvent("SOS", "Emergency SOS button pressed", "CRITICAL");

  // Additional emergency response
  for (int i = 0; i < 20; i++) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    delay(100);
  }
}

void sendInactivityAlert() {
  Serial.println("\n😴 INACTIVITY DETECTED!");
  sendEvent("INACTIVITY", "No movement for 30 minutes", "LOW");
}

void sendStatusUpdate() {
  Serial.println("\n📡 Sending status update...");

  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["bookingId"] = BOOKING_ID;
  doc["status"] = "ACTIVE";
  doc["batteryLevel"] = 100; // Add battery monitoring if needed
  doc["rssi"] = WiFi.RSSI();
  doc["uptime"] = millis() / 1000;

  String payload;
  serializeJson(doc, payload);

  sendMQTTEvent(payload);
}

// ============================================
// CONNECTIVITY FUNCTIONS
// ============================================

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.println(WiFi.RSSI());
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
    blinkLED(5, 200);
  }
}

void connectMQTT() {
  if (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT...");

    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      Serial.println(" ✓ Connected!");
      mqttClient.subscribe("smartcart/commands");
    } else {
      Serial.print(" ✗ Failed, rc=");
      Serial.println(mqttClient.state());
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

void blinkLED(int times, int duration) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(duration);
    digitalWrite(LED_PIN, LOW);
    delay(duration);
  }
}

// ============================================
// CALIBRATION FUNCTION (Run once)
// ============================================

void calibrateSensor() {
  Serial.println("Calibrating MPU6050...");
  Serial.println("Keep device still!");

  delay(2000);

  // Read offset values
  int16_t ax_offset = 0, ay_offset = 0, az_offset = 0;
  int16_t gx_offset = 0, gy_offset = 0, gz_offset = 0;

  for (int i = 0; i < 100; i++) {
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getAcceleration(&ax, &ay, &az);
    mpu.getRotation(&gx, &gy, &gz);

    ax_offset += ax;
    ay_offset += ay;
    az_offset += (az - 8192); // Compensate for gravity
    gx_offset += gx;
    gy_offset += gy;
    gz_offset += gz;

    delay(10);
  }

  // Set offsets
  mpu.setXAccelOffset(ax_offset / 100);
  mpu.setYAccelOffset(ay_offset / 100);
  mpu.setZAccelOffset(az_offset / 100);
  mpu.setXGyroOffset(gx_offset / 100);
  mpu.setYGyroOffset(gy_offset / 100);
  mpu.setZGyroOffset(gz_offset / 100);

  Serial.println("✓ Calibration complete!");
}

