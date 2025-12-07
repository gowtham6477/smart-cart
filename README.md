# Smart Service Management System (Smart Cart)

A comprehensive full-stack web application for managing on-demand services, similar to platforms like Urban Company. The system supports customer bookings, employee task management, admin dashboard, payment integration, and optional IoT device monitoring.

## 🚀 Features

### Customer Portal
- User registration and authentication
- Browse services and packages
- Book services with date, time, and location
- Apply discount coupons
- Online payment via Razorpay
- Track booking status in real-time
- Submit reviews and ratings

### Employee Portal
- View assigned tasks
- Update job status (Accepted → In Progress → Completed)
- Upload before/after service images
- Track attendance

### Admin Dashboard
- Service and package management
- Employee management and task assignment
- Booking oversight with filters
- Coupon management (CRUD operations)
- Revenue and analytics reports
- Customer feedback monitoring
- IoT alert monitoring (optional)

### IoT Integration (Optional)
- Worker safety monitoring (SOS, fall detection)
- Product impact detection
- Real-time alert dashboard

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL (with H2 for testing)
- **Security**: Spring Security + JWT
- **Payment**: Razorpay API
- **Cloud Storage**: Cloudinary
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS/TailwindCSS (or your preferred styling)
- **HTTP Client**: Axios

### IoT (Optional)
- **Hardware**: ESP32 + MPU6050
- **Protocol**: MQTT/HTTP

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Java 17** or higher
- **Node.js 18** or higher
- **Maven 3.8+** or use the included Maven Wrapper
- **MySQL 8.0+**
- **Git**

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gowtham6477/smart-cart.git
cd smartcart
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE smartcart;
```

### 3. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/smartcart
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password

# JWT Configuration
jwt.secret=your_super_secret_jwt_key_min_256_bits
jwt.expiration=86400000

# Cloudinary Configuration
cloudinary.cloud-name=your_cloudinary_cloud_name
cloudinary.api-key=your_cloudinary_api_key
cloudinary.api-secret=your_cloudinary_api_secret

# Razorpay Configuration
razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_key_secret
```

### 4. Backend Setup

#### Using Maven Wrapper (Recommended)

```bash
# Windows
.\mvnw.cmd clean install

# Linux/Mac
./mvnw clean install
```

#### Using Maven (if installed)

```bash
mvn clean install
```

#### Run the Backend

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run

# Or if Maven is installed
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 5. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 6. Configure Frontend Environment

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 7. Run the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 IntelliJ IDEA Setup (Important!)

If you're using IntelliJ IDEA and facing dependency resolution issues:

1. **Enable Annotation Processing**:
   - Go to: `File` → `Settings` → `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
   - Check: ✅ **Enable annotation processing**
   - Click `Apply` and `OK`

2. **Reload Maven Project**:
   - Right-click on `pom.xml`
   - Select: `Maven` → `Reload Project`
   - Or use the Maven tool window and click the refresh icon

3. **Invalidate Caches (if needed)**:
   - Go to: `File` → `Invalidate Caches...`
   - Select: `Invalidate and Restart`

4. **Build the Project**:
   - Go to: `Build` → `Build Project` (Ctrl+F9)

## 📁 Project Structure

```
smartcart/
├── src/main/java/org/example/
│   ├── config/          # Security and app configuration
│   ├── controller/      # REST API controllers
│   ├── dto/             # Data Transfer Objects
│   ├── entity/          # JPA Entities
│   ├── repository/      # Spring Data JPA repositories
│   ├── security/        # JWT and authentication
│   ├── service/         # Business logic
│   └── Main.java        # Application entry point
├── src/main/resources/
│   └── application.properties
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.jsx      # Root component
│   └── package.json
├── pom.xml              # Maven configuration
├── .gitignore
└── README.md
```

## 🔐 Default User Credentials

After the first run, you can create an admin user via the API or database:

```sql
-- Admin User (password: admin123)
INSERT INTO users (name, email, mobile, password, role, created_at, updated_at) 
VALUES ('Admin', 'admin@smartcart.com', '9999999999', '$2a$10$...', 'ADMIN', NOW(), NOW());
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Services
- `GET /api/services` - Get all services
- `POST /api/admin/services` - Create service (Admin)
- `PUT /api/admin/services/{id}` - Update service (Admin)
- `DELETE /api/admin/services/{id}` - Delete service (Admin)

### Bookings
- `POST /api/customer/bookings` - Create booking
- `GET /api/customer/bookings` - Get user bookings
- `GET /api/employee/bookings` - Get assigned bookings
- `PUT /api/employee/bookings/{id}/status` - Update booking status

### Payments
- `POST /api/customer/payments/create` - Create payment order
- `POST /api/customer/payments/verify` - Verify payment

### Coupons
- `POST /api/admin/coupons` - Create coupon (Admin)
- `POST /api/customer/coupons/validate` - Validate coupon

## 🚀 Deployment

### Backend Deployment (Railway/Render/AWS)

1. Set environment variables
2. Build the JAR: `mvn clean package`
3. Deploy the `target/smartcart-1.0-SNAPSHOT.jar`

### Frontend Deployment (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy the `dist` folder

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- Gowtham ([@gowtham6477](https://github.com/gowtham6477))

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or support, please contact: your.email@example.com

---

**Happy Coding! 🎉**

