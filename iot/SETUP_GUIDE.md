# 🔧 IoT Device Setup Guide - ESP32 + MPU6050

## Complete Hardware & Software Setup for Fall Detection System

---

## 📦 Required Components

### Hardware
1. **ESP32 DevKit V1** (or similar ESP32 board with WiFi)
2. **MPU6050 6-Axis IMU** (Accelerometer + Gyroscope)
3. **Breadboard** (400 or 830 tie-points)
4. **Jumper Wires** (Male-to-Male, at least 4)
5. **Push Button** (for SOS functionality, optional)
6. **LED** (for status indication, optional - ESP32 has onboard LED)
7. **USB Cable** (Micro USB or USB-C depending on board)
8. **Power Bank or Battery** (for mobile operation)

### Software
1. **Arduino IDE** (v2.0 or later) or **PlatformIO**
2. **ESP32 Board Support Package**
3. Required Libraries:
   - MPU6050 by Electronic Cats or Adafruit
   - PubSubClient (for MQTT)
   - ArduinoJson (v6.x)
   - HTTPClient (included with ESP32 core)

---

## 🔌 Hardware Connections

### ESP32 to MPU6050 Wiring

| MPU6050 Pin | ESP32 Pin | Description |
|-------------|-----------|-------------|
| VCC         | 3.3V      | Power supply (3.3V ONLY!) |
| GND         | GND       | Ground |
| SDA         | GPIO 21   | I2C Data |
| SCL         | GPIO 22   | I2C Clock |
| AD0         | GND       | I2C Address select (0x68) |
| INT         | (optional)| Interrupt pin |

### Optional Components

#### SOS Button
- One terminal → GPIO 15
- Other terminal → GND
- Internal pull-up resistor enabled in code

#### External LED
- Anode (+) → GPIO 2 (through 220Ω resistor)
- Cathode (-) → GND
- Note: ESP32 has onboard LED on GPIO 2

### Wiring Diagram

```
ESP32                    MPU6050
┌────────┐              ┌─────────┐
│        │              │         │
│  3.3V  ├─────────────►│  VCC    │
│        │              │         │
│  GND   ├─────────────►│  GND    │
│        │              │         │
│  21    ├─────────────►│  SDA    │
│ (SDA)  │              │         │
│        │              │         │
│  22    ├─────────────►│  SCL    │
│ (SCL)  │              │         │
│        │              │         │
│  15    ├───[Button]───┤  GND    │ (SOS Button)
│        │              │         │
│   2    ├───[LED]──────┤  GND    │ (Status LED)
│        │              │         │
└────────┘              └─────────┘
```

---

## 💻 Software Setup

### Step 1: Install Arduino IDE

1. Download from: https://www.arduino.cc/en/software
2. Install for your operating system
3. Launch Arduino IDE

### Step 2: Add ESP32 Board Support

1. Go to **File → Preferences**
2. Add this URL to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to **Tools → Board → Boards Manager**
4. Search for "ESP32"
5. Install "esp32 by Espressif Systems"
6. Wait for installation to complete

### Step 3: Install Required Libraries

1. Go to **Sketch → Include Library → Manage Libraries**
2. Install the following libraries:

   **MPU6050 Library:**
   - Search: "MPU6050"
   - Install: "Adafruit MPU6050" or "MPU6050 by Electronic Cats"

   **ArduinoJson:**
   - Search: "ArduinoJson"
   - Install: "ArduinoJson by Benoit Blanchon" (v6.x)

   **PubSubClient:**
   - Search: "PubSubClient"
   - Install: "PubSubClient by Nick O'Leary"

### Step 4: Configure Board Settings

1. Go to **Tools → Board**
2. Select: "ESP32 Dev Module" or your specific board
3. Configure settings:
   - **Upload Speed**: 921600
   - **CPU Frequency**: 240MHz (WiFi/BT)
   - **Flash Frequency**: 80MHz
   - **Flash Mode**: QIO
   - **Flash Size**: 4MB
   - **Partition Scheme**: Default 4MB with spiffs
   - **Core Debug Level**: None (or Info for debugging)
   - **Port**: Select your USB port (COMx on Windows, /dev/ttyUSBx on Linux)

---

## 🚀 Upload and Configure Firmware

### Step 1: Open the Firmware

1. Navigate to: `smartcart/iot/ESP32_Fall_Detection.ino`
2. Open in Arduino IDE
3. Review the configuration section

### Step 2: Configure WiFi

Modify these lines:

```cpp
const char* WIFI_SSID = "Your_WiFi_SSID";      // Your WiFi name
const char* WIFI_PASSWORD = "Your_WiFi_Password"; // Your WiFi password
```

### Step 3: Configure Backend URL

Modify this line:

```cpp
const char* API_BASE_URL = "http://your-backend-url:8080/api";
```

Examples:
- **Local**: `http://192.168.1.100:8080/api`
- **Cloud**: `http://yourapp.railway.app/api`

### Step 4: Set Device ID

```cpp
const char* DEVICE_ID = "ESP32_001";  // Unique identifier for this device
```

### Step 5: Upload Firmware

1. Connect ESP32 via USB
2. Press **Upload** button (→) in Arduino IDE
3. Wait for "Connecting..." message
4. **Press and hold BOOT button** on ESP32 if connection fails
5. Wait for "Hard resetting via RTS pin..." message
6. Upload complete!

### Step 6: Open Serial Monitor

1. Go to **Tools → Serial Monitor**
2. Set baud rate to: **115200**
3. You should see initialization messages

---

## 🧪 Testing the System

### Test 1: Basic Connectivity

Expected output:
```
=================================
Smart Service Management - IoT Device
Fall Detection & Safety Monitor
=================================

Initializing MPU6050...
✓ MPU6050 connection successful

Connecting to WiFi.....
✓ WiFi Connected!
IP Address: 192.168.1.XXX
Signal Strength: -45

Connecting to MQTT... ✓ Connected!

✓ System Ready!
Monitoring started...

Mag: 1.00 | Var: 0.05 | Ax: 0.00 | Ay: 0.00 | Az: 1.00
```

---

## 📡 Category Profiles & Sensitivity Logic

The firmware now supports **category-based detection profiles** and **mixed-package logic**.

### ✅ Base Profiles

| Category | FF Threshold | FF Duration | MOT Threshold | MOT Duration | Notes |
|----------|--------------|-------------|---------------|--------------|-------|
| High-Fragility (Glass/Ceramics/Instruments/Jewelry) | 350mg | 20ms | 50–100mg | 20ms | Micro-impact = inspection required |
| Structural/Hazardous (Batteries/Chemicals/Electronics) | 450mg | 40–50ms | 1–2g | 40ms | Zero-motion confirm + latch |
| Heavy Industrial (Equipment/Sculptures/Antiques) | 500–600mg | 100ms | 500mg | 60ms | Tilt + tumble detection |

### ✅ Lowest-Common-Denominator Rule
If multiple categories are in a single shipment, thresholds are chosen using the **lowest thresholds** across the mix.

Example:
> Electronics + Batteries ⇒ use Electronics sensitivity for FF/MOT, but keep Hazardous safety rules.

### ✅ Critical Item Selection
If any hazardous item exists, **hazardous becomes primary**. Otherwise the most fragile item dominates.

### ✅ Pro Tips Applied in Firmware
1. **Pre-Impact FIFO**: last ~100ms of motion is buffered and sent with the event.
2. **High-G Clipping Avoidance**: MPU6050 runs at ±16g.
3. **Gravity Vector Compensation**: linear acceleration is computed with a low-pass gravity filter.
4. **Duration Padding**: durations are slightly increased to reduce pothole false positives.

### 🔧 Where to Configure
In `iot/smart cart/src/main.cpp`:

- `PROFILE_FRAGILE`, `PROFILE_HAZARDOUS`, `PROFILE_HEAVY`
- `MIX_HAS_FRAGILE`, `MIX_HAS_HAZARDOUS`, `MIX_HAS_HEAVY`
- `DURATION_PADDING_MS`

Update the mix flags to match your shipment types before flashing the device.

### Test 2: Fall Detection

1. **Hold device steady**
2. **Drop device onto soft surface** (cushion/bed)
3. Expected output:
   ```
   ⚠️  FALL DETECTED!
   ✓ HTTP Event sent: 200
   ✓ MQTT Event published
   ```

### Test 3: Impact Detection

1. **Tap device firmly** (not too hard!)
2. Expected output:
   ```
   🔴 CRITICAL IMPACT DETECTED!
   ✓ HTTP Event sent: 200
   ```

### Test 4: Vibration Detection

1. **Shake device continuously**
2. Expected output:
   ```
   ⚡ ABNORMAL VIBRATION DETECTED!
   ✓ HTTP Event sent: 200
   ```

### Test 5: SOS Button

1. **Press SOS button**
2. Expected output:
   ```
   🆘 SOS BUTTON PRESSED!
   ✓ HTTP Event sent: 200
   ```

### Test 6: Backend Verification

Check if events are received:

```bash
curl http://localhost:8080/api/iot/events
```

Expected response:
```json
[
  {
    "id": "...",
    "deviceId": "ESP32_001",
    "eventType": "FALL",
    "magnitude": 2.8,
    "timestamp": "2025-12-20T10:30:45",
    "resolved": false
  }
]
```

---

## 🔧 Calibration (Important!)

### Why Calibrate?
- Remove sensor bias
- Improve accuracy
- Reduce false positives

### Calibration Procedure

1. Place device on **flat, stable surface**
2. Uncomment calibration code in `setup()`:
   ```cpp
   // calibrateSensor();
   ```
3. Upload firmware
4. Wait for "Calibration complete!" message
5. Comment out calibration line again
6. Upload final firmware

---

## 📊 Understanding Sensor Data

### Accelerometer Values (g-force)
- **1g** = Normal gravity (device at rest)
- **0g** = Free fall
- **>2g** = Significant movement/impact

### Magnitude Calculation
```
magnitude = sqrt(ax² + ay² + az²)
```

### Detection Thresholds

| Threshold | Value | Meaning |
|-----------|-------|---------|
| FALL_THRESHOLD | 2.5g | Product falling |
| IMPACT_THRESHOLD | 3.0g | Hard collision |
| VIBRATION_THRESHOLD | 0.5 variance | Abnormal shaking |

### Adjusting Thresholds

Modify these values based on your product:

```cpp
const float FALL_THRESHOLD = 2.5;      // Increase for less sensitive
const float IMPACT_THRESHOLD = 3.0;    // Lower for more sensitive
const float VIBRATION_THRESHOLD = 0.5; // Adjust for product type
```

---

## 🐛 Troubleshooting

### Issue: WiFi Won't Connect

**Solutions:**
1. Check SSID and password (case-sensitive!)
2. Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
3. Move closer to router
4. Check router firewall settings

**Debug code:**
```cpp
WiFi.printDiag(Serial);
```

### Issue: MPU6050 Not Found

**Solutions:**
1. Check wiring (especially VCC to 3.3V, NOT 5V!)
2. Verify I2C address: Run I2C scanner sketch
3. Try different I2C pins
4. Check for loose connections

**I2C Scanner code:**
```cpp
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(115200);
  Serial.println("Scanning I2C bus...");
  
  for(byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if(Wire.endTransmission() == 0) {
      Serial.printf("Device found at 0x%02X\n", addr);
    }
  }
}

void loop() {}
```

### Issue: HTTP Requests Failing

**Solutions:**
1. Verify backend is running: `curl http://backend-url/actuator/health`
2. Check firewall rules
3. Ensure CORS is enabled on backend
4. Print HTTP error details

**Debug code:**
```cpp
Serial.println("HTTP Error: " + http.errorToString(httpCode));
Serial.println("Response: " + http.getString());
```

### Issue: Too Many False Positives

**Solutions:**
1. Increase thresholds
2. Add moving average filter
3. Implement debounce logic
4. Calibrate sensor properly

**Moving average example:**
```cpp
float smoothMagnitude(float current, float previous, float alpha = 0.8) {
  return alpha * current + (1 - alpha) * previous;
}
```

### Issue: Device Keeps Restarting

**Solutions:**
1. Check power supply (min 500mA)
2. Add delays in loop()
3. Disable watchdog timer
4. Check for stack overflow

**Watchdog disable:**
```cpp
disableCore0WDT();
disableCore1WDT();
```

---

## 🔋 Power Management

### Battery Operation

For mobile/portable use:

1. **Use Li-Ion battery** (3.7V, 2000mAh+)
2. **Add TP4056 charging module**
3. **Implement deep sleep** between readings

**Deep sleep example:**
```cpp
esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 seconds
esp_deep_sleep_start();
```

### Power Consumption

- **Active mode**: ~240mA (WiFi on, continuous reading)
- **Idle mode**: ~80mA (WiFi connected, idle)
- **Light sleep**: ~20mA (WiFi off)
- **Deep sleep**: ~10µA

---

## 📡 MQTT Setup (Optional)

### Why Use MQTT?
- Lower latency
- Better for real-time alerts
- Less bandwidth usage
- Bidirectional communication

### MQTT Broker Options

1. **Cloud Brokers:**
   - HiveMQ Cloud (free tier)
   - EMQX Cloud
   - AWS IoT Core

2. **Self-hosted:**
   - Mosquitto (lightweight)
   - EMQX (feature-rich)

### Configure MQTT in Firmware

```cpp
const char* MQTT_BROKER = "broker.hivemq.com";
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "smartcart/events";
const char* MQTT_CLIENT_ID = "ESP32_001";
```

### Subscribe to Commands

Add command handling:

```cpp
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for(int i=0; i<length; i++) {
    message += (char)payload[i];
  }
  
  if(message == "STATUS") {
    sendStatusUpdate();
  }
  else if(message == "CALIBRATE") {
    calibrateSensor();
  }
}
```

---

## 🚀 Production Deployment

### Checklist

- [ ] Calibrate all devices
- [ ] Test in actual usage conditions
- [ ] Set unique device IDs
- [ ] Configure proper WiFi credentials
- [ ] Set production backend URL
- [ ] Test battery life
- [ ] Weatherproof enclosure (if outdoor)
- [ ] Label devices clearly
- [ ] Document device-to-booking mapping

### Enclosure Recommendations

1. **Plastic project box** (IP65 rated)
2. **3D printed case** (with vent holes)
3. **Waterproof case** (for outdoor/wet use)

### Mounting Options

1. **Velcro strips** (temporary)
2. **Zip ties** (secure)
3. **Adhesive mounts** (permanent)
4. **Magnetic mount** (metal surfaces)

---

## 📈 Advanced Features

### GPS Integration (NEO-6M)

Add location tracking:

```cpp
#include <TinyGPS++.h>

TinyGPSPlus gps;
HardwareSerial GPS(2);

void setup() {
  GPS.begin(9600, SERIAL_8N1, 16, 17); // RX, TX
}

void getLocation() {
  if(GPS.available() && gps.encode(GPS.read())) {
    if(gps.location.isValid()) {
      float lat = gps.location.lat();
      float lng = gps.location.lng();
      // Add to event payload
    }
  }
}
```

### Temperature Monitoring

Add DS18B20 sensor for temperature tracking.

### Battery Monitoring

```cpp
int batteryLevel = analogRead(35); // ESP32 ADC pin
float voltage = (batteryLevel / 4095.0) * 3.3 * 2; // Voltage divider
int percentage = map(voltage*100, 320, 420, 0, 100);
```

---

## 📞 Support

For hardware/firmware issues:
- Check ESP32 forums
- Review Arduino IDE documentation
- Test with example sketches

For backend integration:
- See main README.md
- Check API documentation
- Review backend logs

---

**Happy Building! 🎉**

Your IoT fall detection system is ready to protect products and build customer trust!

