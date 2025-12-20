# 🛒 Smart Service & Product Management System (SmartCart)

An intelligent, IoT-integrated platform that revolutionizes service and product management through real-time monitoring, automated workflows, and transparent operations. Built with **React**, **Spring Boot**, **MongoDB Atlas**, and **ESP32 + MPU6050** IoT sensors, this system addresses critical operational challenges in service-oriented businesses by providing end-to-end visibility, automated damage detection, and instant refund/replacement workflows.

## 📋 Problem Statement

In many service and product-oriented businesses, operational workflows remain highly manual and fragmented:

- **Customers** struggle with unclear booking processes, inconsistent delivery updates, and lack of transparency around product handling or service execution
- **Employees** receive job details through informal channels, making task coordination inefficient and prone to errors
- **Administrators** lack a centralized dashboard to manage bookings, track employee performance, verify task completion, and respond to customer issues
- **Critical Gap**: No mechanism to detect events such as accidental product drops, mishandling, or field-related risks in real-time, leading to trust issues, operational delays, and frequent disputes regarding damage or service quality

## 🎯 Solution Overview

This project introduces a **unified digital platform** that streamlines customer interactions, employee workflows, and administrative control with **integrated IoT intelligence**. The system features:

✅ **Automated Fall Detection** - ESP32 + MPU6050 sensors detect product drops, impacts, and mishandling in real-time  
✅ **Smart Refund Workflows** - Automated policies trigger notifications and initiate refund/replacement evaluations  
✅ **Real-time Monitoring** - Live tracking of product handling, service execution, and employee activities  
✅ **Transparent Operations** - Complete visibility for customers, employees, and administrators  
✅ **Data-Driven Decisions** - Analytics and insights for business optimization

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🌟 Key Features

### 🔬 IoT Intelligence & Safety Monitoring
- **Real-time Fall Detection** - ESP32 + MPU6050 accelerometer/gyroscope sensors detect product drops and impacts
- **Threshold-based Algorithm** - Monitors accelerometer magnitude and variance for abnormal movements
- **Automated Alert System** - Instant notifications to admins and customers when incidents occur
- **Impact Analysis** - Detailed event logs with timestamp, location, and severity data
- **Automated Refund Triggers** - Policy-based refund/replacement workflows initiated by IoT events
- **Product Safety Tracking** - Continuous monitoring during transit and service delivery
- **SOS & Emergency Alerts** - Worker safety features with fall detection and inactivity monitoring

### For Customers 👥
- ✅ Intuitive service/product booking with complete transparency
- ✅ Real-time tracking of product handling and service execution
- ✅ Automated notifications for any detected mishandling or damage
- ✅ Instant refund/replacement requests triggered by IoT events
- ✅ Detailed service pages with package options and pricing
- ✅ Secure online payments with Razorpay integration
- ✅ Before/after image verification for completed services
- ✅ Rating and review system with verified feedback
- ✅ Booking history with IoT event logs
- ✅ Multiple address management with GPS integration

### For Employees 👨‍🔧
- ✅ Mobile-optimized task dashboard with daily assignments
- ✅ Step-by-step workflow (Accepted → On the Way → In Progress → Completed)
- ✅ Mandatory before/after image uploads for accountability
- ✅ IoT device pairing for product safety monitoring
- ✅ GPS-based location tracking during service delivery
- ✅ Customer contact integration (call/message)
- ✅ Automated attendance tracking via first login
- ✅ Performance metrics and earnings dashboard
- ✅ Real-time alerts for IoT-detected incidents

### For Administrators 🔐
- ✅ Comprehensive dashboard with real-time KPIs and analytics
- ✅ **IoT Event Monitor** - Live feed of all sensor-detected incidents
- ✅ **Automated Refund Management** - Review and approve IoT-triggered claims
- ✅ Service & package catalog management (CRUD operations)
- ✅ Employee management with skills matching and task assignment
- ✅ Intelligent booking assignment based on location and availability
- ✅ Coupon creation with advanced rules (time-based, usage limits)
- ✅ Payment reconciliation and revenue reports
- ✅ Customer feedback analysis and dispute resolution
- ✅ Image verification for service completion
- ✅ Performance analytics for employees and services

### Technical Excellence 🚀
- 🔐 **JWT-based Authentication** - Stateless, secure token management
- 🛡️ **Role-Based Access Control** - Granular permissions (Customer, Employee, Admin)
- 📱 **Fully Responsive UI** - Mobile-first design with Tailwind CSS
- ⚡ **Real-time Updates** - WebSocket integration for live notifications
- 🎨 **Modern UI/UX** - Framer Motion animations and interactive components
- 📊 **Advanced Analytics** - Recharts visualization for business insights
- 🖼️ **Cloud Storage** - Cloudinary integration for optimized image delivery
- 💳 **Secure Payments** - Razorpay gateway with webhook verification
- 🌐 **RESTful API** - Well-documented endpoints with validation
- 📡 **MQTT Integration** - Lightweight protocol for IoT device communication
- 🔄 **Automated Workflows** - Event-driven architecture for business processes
- 📈 **Scalable Architecture** - MongoDB Atlas for cloud-native scaling

---

## 🏗️ Tech Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring Security** - Authentication & authorization
- **Spring Data MongoDB** - Database ORM
- **JWT** - Token-based authentication
- **BCrypt** - Password encryption
- **Maven** - Build tool
- **Lombok** - Code generation

### Frontend
- **React 18.2** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tanstack React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Socket.io Client** - Real-time communication
- **Vite** - Build tool

### IoT Hardware & Protocols
- **ESP32** - Microcontroller with WiFi/Bluetooth
- **MPU6050** - 6-axis accelerometer & gyroscope sensor
- **MQTT Protocol** - Lightweight messaging for IoT
- **HTTP/REST** - Alternative communication protocol
- **Arduino IDE** - Firmware development

### Database & Cloud
- **MongoDB Atlas** - Cloud database with auto-scaling
- **Cloudinary** - Image storage & optimization
- **Razorpay** - Payment gateway integration

### IoT Architecture
```
ESP32 + MPU6050 → MQTT Broker → Backend API → MongoDB
                     ↓
              Real-time Alerts → Admin Dashboard
                     ↓
              Automated Workflows → Customer Notifications
```

---

## 📋 Prerequisites

### Software Requirements
- ☕ **Java 17** or higher
- 📦 **Node.js 18+** and npm
- 🗄️ **MongoDB Atlas** account (or local MongoDB)
- 🔑 **Cloudinary** account (for image uploads)
- 💳 **Razorpay** account (for payments)
- 🐙 **Git**

### IoT Hardware (Optional for full functionality)
- 🔧 **ESP32 Development Board** (WiFi enabled)
- 📡 **MPU6050 Sensor Module** (6-axis IMU)
- 🔌 **Jumper Wires** and breadboard
- 💻 **Arduino IDE** or PlatformIO
- 🌐 **MQTT Broker** (EMQX, Mosquitto, or cloud service)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/gowtham6477/smart-cart.git
cd smart-cart
```

### 2. Backend Setup

#### Configure MongoDB Atlas

1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
spring.data.mongodb.database=smart-cart
```

#### Configure Other Services

Update the following in `application.properties`:

```properties
# JWT Secret (change in production!)
jwt.secret=YourVeryLongSecretKey

# Cloudinary
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret

# Razorpay
razorpay.key-id=your-razorpay-key-id
razorpay.key-secret=your-razorpay-key-secret
```

#### Run Backend

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Backend will start on: **http://localhost:8080**

### 3. Frontend Setup

#### Navigate to frontend directory

```bash
cd frontend
```

#### Install dependencies

```bash
npm install
```

#### Configure Environment

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

#### Run Frontend

```bash
npm run dev
```

Frontend will start on: **http://localhost:5173**

### 4. IoT Device Setup (Optional)

#### Hardware Connections

Connect the MPU6050 to ESP32:
- VCC → 3.3V
- GND → GND
- SDA → GPIO 21
- SCL → GPIO 22

#### Flash ESP32 Firmware

1. Install Arduino IDE and required libraries:
   - ESP32 Board Support
   - MPU6050 Library (Adafruit or I2Cdev)
   - PubSubClient (for MQTT)

2. Configure WiFi and MQTT settings in the firmware
3. Upload the fall detection code to ESP32

#### Fall Detection Algorithm

The system uses a threshold-based approach:

```cpp
// Calculate accelerometer magnitude
float magnitude = sqrt(ax*ax + ay*ay + az*az);

// Detect sudden impact (fall detection)
if (magnitude > FALL_THRESHOLD) {
    triggerFallAlert();
}

// Calculate variance for vibration detection
if (variance > VIBRATION_THRESHOLD) {
    triggerVibrationAlert();
}
```

**Default Thresholds:**
- Fall Detection: `magnitude > 2.5g`
- Impact Detection: `magnitude > 3.0g`
- Vibration: `variance > 0.5`

#### Test IoT Integration

Send a test event via HTTP:

```bash
curl -X POST http://localhost:8080/api/iot/events \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32_001",
    "eventType": "FALL",
    "accelerometerData": {"x": 1.2, "y": -0.5, "z": 9.8},
    "gyroscopeData": {"x": 0, "y": 0, "z": 0},
    "magnitude": 9.9,
    "variance": 0.8
  }'
```

---

## 🔬 IoT Fall Detection System

### How It Works

1. **Continuous Monitoring** - ESP32 reads MPU6050 sensor data at 100Hz
2. **Algorithm Processing** - Calculates magnitude and variance in real-time
3. **Event Detection** - Triggers alert when thresholds are exceeded
4. **Data Transmission** - Sends event via MQTT/HTTP to backend
5. **Automated Response** - Backend processes event and triggers workflows:
   - Notify customer and admin
   - Flag booking for review
   - Initiate refund/replacement evaluation
   - Log incident with timestamp and sensor data

### Supported Event Types

| Event Type | Description | Threshold | Action |
|------------|-------------|-----------|--------|
| **FALL** | Product dropped or fell | > 2.5g | Immediate alert + refund trigger |
| **IMPACT** | Hard collision or hit | > 3.0g | Critical alert + investigation |
| **VIBRATION** | Abnormal shaking | Variance > 0.5 | Warning + monitoring |
| **SOS** | Emergency button press | N/A | Immediate response |
| **INACTIVITY** | No movement for 30+ min | N/A | Check-in alert |

### Backend Integration

IoT events are automatically processed through:

```java
// IoTController.java
@PostMapping("/events")
public ResponseEntity<?> processIoTEvent(@RequestBody IoTEventRequest event) {
    // 1. Validate and store event
    IoTEvent savedEvent = ioTService.saveEvent(event);
    
    // 2. Trigger automated workflows
    if (event.getEventType().equals("FALL") || event.getEventType().equals("IMPACT")) {
        // Notify customer
        notificationService.sendCustomerAlert(savedEvent);
        
        // Notify admin
        notificationService.sendAdminAlert(savedEvent);
        
        // Flag booking for refund
        bookingService.flagForRefund(savedEvent.getBookingId());
    }
    
    return ResponseEntity.ok(savedEvent);
}
```

---

## 📁 Project Structure

```
smart-cart/
├── src/                          # Backend source
│   └── main/
│       ├── java/org/example/
│       │   ├── config/          # Spring configurations
│       │   ├── controller/      # REST controllers
│       │   ├── dto/             # Data transfer objects
│       │   ├── entity/          # MongoDB entities
│       │   ├── repository/      # Data repositories
│       │   ├── security/        # Security & JWT
│       │   ├── service/         # Business logic
│       │   └── Main.java        # Application entry
│       └── resources/
│           └── application.properties
│
├── frontend/                     # Frontend source
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── layout/          # Layout components
│   │   │   └── routes/          # Route guards
│   │   ├── config/              # Configuration
│   │   ├── lib/                 # Utilities
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin pages
│   │   │   ├── auth/            # Auth pages
│   │   │   ├── customer/        # Customer pages
│   │   │   └── employee/        # Employee pages
│   │   ├── services/            # API services
│   │   ├── stores/              # State management
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Static assets
│   └── package.json
│
├── pom.xml                       # Maven configuration
└── README.md                     # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Customer APIs
- `GET /api/services` - List all services
- `GET /api/services/{id}` - Get service details
- `POST /api/customer/bookings` - Create booking
- `GET /api/customer/bookings` - Get my bookings
- `PUT /api/customer/bookings/{id}` - Update booking
- `POST /api/customer/payments/create-order` - Create payment order
- `POST /api/customer/payments/verify` - Verify payment

### Employee APIs
- `GET /api/employee/bookings` - Get assigned bookings
- `PUT /api/employee/bookings/{id}/status` - Update job status
- `POST /api/employee/bookings/{id}/images` - Upload images
- `POST /api/employee/attendance/checkin` - Check in/out

### Admin APIs
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/{id}` - Update service
- `DELETE /api/admin/services/{id}` - Delete service
- `POST /api/admin/employees` - Create employee
- `GET /api/admin/bookings` - Get all bookings
- `POST /api/admin/coupons` - Create coupon
- `GET /api/admin/payments` - Payment reports

### IoT APIs
- `POST /api/iot/events` - Receive IoT device event
- `GET /api/iot/events` - List all IoT events (Admin)
- `GET /api/iot/events/{id}` - Get specific event details
- `GET /api/iot/events/booking/{bookingId}` - Get events for a booking
- `PUT /api/iot/events/{id}/resolve` - Mark event as resolved (Admin)
- `GET /api/iot/devices/{deviceId}/status` - Get device status

---

## 👥 User Roles

### Customer
- Default role for new registrations
- Can browse services and create bookings
- Access to personal booking history

### Employee
- Created by administrators
- Assigned to service bookings
- Updates job status and uploads images

### Admin
- Full system access
- Manages services, employees, and coupons
- Views analytics and reports

---

## 🗄️ Database Schema

### Collections

#### users
- User authentication and profile data
- Fields: name, email, phone, password, role, createdAt

#### services
- Service catalog with descriptions
- Fields: name, description, category, isActive, images

#### packages
- Service packages with pricing
- Fields: serviceId, name, description, price, duration

#### bookings
- Customer service bookings
- Fields: customerId, serviceId, packageId, scheduledDateTime, status, address

#### employees
- Employee profiles and skills
- Fields: userId, skills, rating, availability

#### payments
- Payment transactions
- Fields: bookingId, amount, status, gatewayOrderId, transactionId

#### coupons
- Discount coupons
- Fields: code, type, value, minOrderValue, validFrom, validTo

#### iot_events
- IoT device events and alerts
- Fields: deviceId, bookingId, eventType, accelerometerData, gyroscopeData, magnitude, variance, timestamp, resolved, severity

#### employee_attendance
- Employee check-in/check-out records
- Fields: employeeId, checkInTime, checkOutTime, date, location

---

## 🧪 Testing

### Backend Tests
```bash
.\mvnw.cmd test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🔒 Security Features

- ✅ JWT-based stateless authentication
- ✅ Password hashing with BCrypt
- ✅ Role-based access control
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection protection (NoSQL in this case)
- ✅ XSS prevention
- ✅ CSRF protection

---

## 📱 Screenshots

*(Add screenshots here)*

---

## 🚢 Deployment

### Backend (Railway / Heroku / AWS)

1. Set environment variables
2. Configure production MongoDB connection
3. Deploy JAR file or use Docker

### Frontend (Vercel / Netlify / AWS S3)

1. Build production bundle: `npm run build`
2. Deploy `dist` folder
3. Configure environment variables

---

## 📚 Documentation

- [Installation Guide](INSTALLATION_GUIDE.md)
- [MongoDB Setup](MONGODB_ATLAS_SETUP.md)
- [Frontend Guide](frontend/FRONTEND_IMPLEMENTATION_GUIDE.md)
- [API Documentation](API_DOCS.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Gowtham**
- GitHub: [@gowtham6477](https://github.com/gowtham6477)

---

## 🙏 Acknowledgments

- Spring Boot Documentation
- React Documentation
- MongoDB Atlas
- Tailwind CSS
- All open-source contributors

---

## 📞 Support

For support, email support@smartcart.com or create an issue in this repository.

---

## 🔮 Future Enhancements

- [ ] Mobile app (React Native) for customers and employees
- [ ] Real-time GPS tracking for employee location and route optimization
- [ ] AI-based dynamic pricing using machine learning models
- [ ] Automated service assignment based on proximity and availability
- [ ] Multi-language support (i18n)
- [ ] Voice-activated booking through virtual assistants
- [ ] **Enhanced IoT Integration** - GPS tracking on ESP32 for product location
- [ ] **Machine Learning Fall Detection** - Neural network-based anomaly detection
- [ ] **Predictive Maintenance** - Anticipate equipment failures before they occur
- [ ] **Blockchain Integration** - Immutable audit trail for refund/replacement claims
- [ ] Advanced analytics dashboard with predictive insights
- [ ] Subscription plans and loyalty rewards program
- [ ] Integration with third-party logistics providers
- [ ] Video verification for high-value service completion
- [ ] Augmented Reality (AR) for service demonstrations

---

<div align="center">

Made with ❤️ by Gowtham

⭐ Star this repository if you find it helpful!

</div>

