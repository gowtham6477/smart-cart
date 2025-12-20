# 🚀 Smart Service Management System - Running Guide

## ✅ Project Status: RUNNING

Both frontend and backend servers have been started successfully!

---

## 🖥️ Backend Server (Spring Boot)

**Status:** Running  
**Port:** 8080  
**URL:** http://localhost:8080  
**API Base:** http://localhost:8080/api

### Backend Endpoints:
- Health Check: http://localhost:8080/actuator/health
- API Documentation: http://localhost:8080/api/

### Database:
- **Type:** MongoDB Atlas
- **Database:** smart-cart
- **Status:** Connected

---

## 🌐 Frontend Server (Vite + React)

**Status:** Running  
**Port:** 5173 (default Vite port)  
**URL:** http://localhost:5173

### Available Routes:

#### Public Routes:
- Home: http://localhost:5173/
- Services: http://localhost:5173/services
- Login: http://localhost:5173/auth/login
- Register: http://localhost:5173/auth/register

#### Customer Routes (After Login):
- My Bookings: http://localhost:5173/my/bookings
- Service Detail: http://localhost:5173/services/:id

#### Employee Routes:
- Dashboard: http://localhost:5173/employee
- Bookings: http://localhost:5173/employee/bookings

#### Admin Routes:
- Dashboard: http://localhost:5173/admin
- Services Management: http://localhost:5173/admin/services
- Employees Management: http://localhost:5173/admin/employees
- Bookings Management: http://localhost:5173/admin/bookings
- Coupons Management: http://localhost:5173/admin/coupons
- Payments: http://localhost:5173/admin/payments

---

## 📝 How to Access

1. **Open your browser** and go to: http://localhost:5173
2. **Default Admin Credentials** (if seeded):
   - Email: admin@smartcart.com
   - Password: admin123

3. **Register a new customer** account from the register page
4. **Browse services** and make bookings

---

## 🔧 Development Commands

### Backend:
```powershell
# Stop and restart backend
cd "E:\Smart service management\smartcart"
.\mvnw.cmd spring-boot:run
```

### Frontend:
```powershell
# Stop and restart frontend
cd "E:\Smart service management\smartcart\frontend"
npm run dev
```

### Stop Servers:
- Press `Ctrl+C` in the terminal windows running the servers

---

## 🌟 Features Available

### Customer Features:
✅ Browse Services  
✅ Service Detail View  
✅ Create Bookings  
✅ Online Payments (Razorpay)  
✅ Apply Coupons  
✅ Track Booking Status  
✅ Rate & Review Services  

### Employee Features:
✅ View Assigned Tasks  
✅ Update Job Status  
✅ Upload Before/After Images  
✅ Attendance Tracking  

### Admin Features:
✅ Service Management (CRUD)  
✅ Employee Management  
✅ Booking Management & Assignment  
✅ Coupon Management  
✅ Payment Reports  
✅ Dashboard with KPIs  
✅ IoT Event Monitoring (Optional)  

---

## 📦 Installed Packages

### Backend (Java/Spring Boot):
- Spring Boot Web
- Spring Data MongoDB
- Spring Security
- JWT Authentication
- BCrypt Password Encoding
- Validation
- Actuator
- Lombok

### Frontend (React):
- React 18.2.0
- React Router DOM
- Axios (API calls)
- Tanstack React Query
- Zustand (State Management)
- React Hook Form
- Tailwind CSS
- Framer Motion (Animations)
- React Hot Toast (Notifications)
- Recharts (Charts)
- Lucide React (Icons)
- Socket.io Client (Real-time)
- Date-fns (Date handling)
- Swiper (Carousels)

---

## 🔐 Security Features

✅ JWT-based Authentication  
✅ BCrypt Password Hashing  
✅ Role-based Access Control (CUSTOMER, EMPLOYEE, ADMIN)  
✅ Protected API Endpoints  
✅ CORS Configuration  
✅ Input Validation  

---

## 🗄️ Database Collections

MongoDB collections created automatically:
- users
- services
- packages
- employees
- bookings
- booking_images
- coupons
- payments
- employee_attendance
- iot_events

---

## 🐛 Troubleshooting

### Backend not starting?
1. Check if MongoDB Atlas connection is working
2. Verify port 8080 is not in use
3. Check Java version (must be 17+)

### Frontend not starting?
1. Ensure node_modules are installed: `npm install`
2. Verify port 5173 is not in use
3. Check .env file exists

### API calls failing?
1. Verify backend is running on port 8080
2. Check CORS configuration
3. Verify API_BASE_URL in frontend/.env

---

## 🚀 Next Steps

1. **Create Admin User**: Use the register endpoint or seed script
2. **Add Services**: Login as admin and create services
3. **Add Employees**: Create employee accounts
4. **Test Booking Flow**: Register as customer and make a booking
5. **Configure Payment Gateway**: Add real Razorpay credentials
6. **Configure Cloud Storage**: Setup Cloudinary for image uploads

---

## 📞 Support

For issues or questions:
1. Check the logs in the terminal
2. Review the API documentation
3. Check MongoDB Atlas dashboard for database issues

---

## 🎉 Congratulations!

Your Smart Service Management System is now running successfully!

Visit: **http://localhost:5173** to get started!

---

*Last Updated: December 20, 2025*

