# MongoDB Atlas Setup Guide for Smart Service Management System

## 📋 Prerequisites
- Email account for MongoDB Atlas signup
- Internet connection
- Web browser

---

## 🚀 Step 1: Create MongoDB Atlas Account

### 1.1 Sign Up
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up using:
   - Email + Password
   - OR Google account
   - OR GitHub account

### 1.2 Verify Email
- Check your email for verification link
- Click the link to verify your account

---

## ☁️ Step 2: Create a Free Cluster

### 2.1 Choose Deployment Option
1. After login, you'll see "Create a deployment"
2. Click **"Create"** under **M0 FREE** tier
   - ✅ 512 MB Storage
   - ✅ Shared RAM
   - ✅ No credit card required

### 2.2 Configure Cluster
1. **Cloud Provider**: Select **AWS** (recommended)
2. **Region**: Choose closest to you:
   - Asia: Mumbai / Singapore / Tokyo
   - US: N. Virginia / Oregon
   - Europe: Ireland / Frankfurt
3. **Cluster Name**: `smartcart-cluster` (or keep default)
4. Click **"Create Deployment"**

### 2.3 Security Setup
You'll see a popup with security setup:

#### Create Database User:
- **Username**: `smartcart_admin`
- **Password**: Click "Autogenerate Secure Password" OR create your own
- ⚠️ **IMPORTANT**: Copy and save this password!
- Click **"Create Database User"**

#### Add IP Address:
- Choose: **"Add My Current IP Address"**
- OR: **"Allow Access from Anywhere"** (for development)
  - This adds: `0.0.0.0/0`
- Click **"Add Entry"**
- Click **"Finish and Close"**

---

## 🔗 Step 3: Get Connection String

### 3.1 Navigate to Connect
1. In your cluster, click **"Connect"** button
2. Choose: **"Connect your application"**

### 3.2 Copy Connection String
1. **Driver**: Select **Java**
2. **Version**: Select **4.3 or later**
3. You'll see a connection string like:
   ```
   mongodb+srv://smartcart_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Click **"Copy"** button

### 3.3 Modify Connection String
Replace `<password>` with your actual password:
```
mongodb+srv://smartcart_admin:YourActualPassword@cluster0.xxxxx.mongodb.net/smartcart?retryWrites=true&w=majority
```

**Note**: Added `/smartcart` before the `?` to specify database name

---

## ⚙️ Step 4: Update Application Configuration

### 4.1 Open application.properties
Navigate to: `src/main/resources/application.properties`

### 4.2 Update MongoDB Configuration
Replace the MongoDB connection string:

```properties
# MongoDB Atlas Configuration
spring.data.mongodb.uri=mongodb+srv://smartcart_admin:YourActualPassword@cluster0.xxxxx.mongodb.net/smartcart?retryWrites=true&w=majority
spring.data.mongodb.database=smartcart

# MongoDB Auto-index creation
spring.data.mongodb.auto-index-creation=true
```

### 4.3 Complete Configuration Example

```properties
# Application Configuration
spring.application.name=Smart Service Management System
server.port=8080

# MongoDB Atlas Configuration
spring.data.mongodb.uri=mongodb+srv://smartcart_admin:YourPassword123@cluster0.abc12.mongodb.net/smartcart?retryWrites=true&w=majority
spring.data.mongodb.database=smartcart
spring.data.mongodb.auto-index-creation=true

# JWT Configuration
jwt.secret=SmartServiceManagementSystemSecretKey2024VeryLongSecureKeyForJWTTokenGeneration
jwt.expiration=86400000
jwt.refresh.expiration=604800000

# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Cloudinary Configuration
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# Razorpay Configuration (Test mode)
razorpay.key-id=your_razorpay_key_id
razorpay.key-secret=your_razorpay_key_secret

# Logging
logging.level.org.example=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.data.mongodb=DEBUG

# Actuator
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

---

## 🎯 Step 5: Create Database and Collections (Optional)

MongoDB will auto-create collections when you insert data, but you can create them manually:

### 5.1 Access Database
1. In MongoDB Atlas, click **"Browse Collections"**
2. Click **"Add My Own Data"**

### 5.2 Create Database
- **Database Name**: `smartcart`
- **Collection Name**: `users`
- Click **"Create"**

### 5.3 Collections to Create (Optional)
- `users`
- `services`
- `service_packages`
- `bookings`
- `payments`
- `coupons`
- `booking_images`
- `employee_attendance`
- `iot_events`

*(These will be auto-created when the application runs)*

---

## 🧪 Step 6: Test Connection

### 6.1 Run the Application
1. In IntelliJ, right-click `Main.java`
2. Select **"Run 'Main.main()'"**

### 6.2 Check Console Output
Look for these messages:
```
✅ Connected to MongoDB successfully
✅ Database: smartcart
✅ Application started on port 8080
```

### 6.3 Verify in MongoDB Atlas
1. Go to **"Browse Collections"** in MongoDB Atlas
2. Select `smartcart` database
3. You should see collections being created

---

## 🔐 Step 7: Security Best Practices

### 7.1 IP Whitelist
For production:
1. Go to **"Network Access"** in MongoDB Atlas
2. Remove `0.0.0.0/0` if added
3. Add only specific IP addresses

### 7.2 Database User Permissions
1. Go to **"Database Access"**
2. Create separate users for:
   - Development: Read/Write
   - Production: Read/Write with restrictions
   - Backup: Read-only

### 7.3 Connection String Security
⚠️ **NEVER commit passwords to Git!**

Use environment variables:
```properties
spring.data.mongodb.uri=${MONGODB_URI}
```

Set environment variable:
```bash
# Windows
set MONGODB_URI=mongodb+srv://...

# Linux/Mac
export MONGODB_URI=mongodb+srv://...
```

---

## 📊 Step 8: Monitor Database

### 8.1 Metrics
1. Go to **"Metrics"** tab in MongoDB Atlas
2. View:
   - Connections
   - Operations per second
   - Network usage
   - Storage usage

### 8.2 Alerts
1. Go to **"Alerts"** tab
2. Set up alerts for:
   - High CPU usage
   - High connection count
   - Storage threshold

---

## 🛠️ Troubleshooting

### Problem: Cannot connect to MongoDB

**Solution 1**: Check IP whitelist
- Go to "Network Access"
- Ensure your IP is added

**Solution 2**: Verify credentials
- Username and password are correct
- Password doesn't contain special characters that need encoding

**Solution 3**: Check connection string
- Database name is included
- No spaces or typos

### Problem: Authentication failed

**Solution**:
- Verify username and password
- Password may need URL encoding:
  - `@` → `%40`
  - `#` → `%23`
  - `/` → `%2F`

### Problem: Network timeout

**Solution**:
- Check firewall settings
- Try "Allow Access from Anywhere" temporarily
- Verify internet connection

---

## 📝 Connection String Format Explained

```
mongodb+srv://[username]:[password]@[cluster-url]/[database]?[options]
```

- **mongodb+srv://**: Protocol (SRV for automatic replica set discovery)
- **username**: Database user (not Atlas account)
- **password**: Database user password
- **cluster-url**: Your cluster address (e.g., cluster0.abc12.mongodb.net)
- **database**: Database name (smartcart)
- **options**: Connection options (retryWrites, w=majority)

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster deployed
- [ ] Database user created (username + password saved)
- [ ] IP address whitelisted
- [ ] Connection string copied
- [ ] Password replaced in connection string
- [ ] application.properties updated
- [ ] Application runs without errors
- [ ] Can see collections in MongoDB Atlas
- [ ] Test data inserted successfully

---

## 🎉 Success!

If you can:
1. ✅ Start the application without errors
2. ✅ Register a user via API
3. ✅ See data in MongoDB Atlas

Then your MongoDB Atlas setup is complete!

---

## 📚 Additional Resources

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Spring Data MongoDB**: https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/
- **Connection String Options**: https://docs.mongodb.com/manual/reference/connection-string/

---

## 🆘 Need Help?

If you encounter issues:
1. Check MongoDB Atlas status: https://status.mongodb.com/
2. Review connection string format
3. Verify firewall and network settings
4. Check application logs for detailed error messages

---

**Last Updated**: December 7, 2025
**Version**: 1.0
**Status**: Ready for Development ✅

