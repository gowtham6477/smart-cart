# Complete Setup Guide for Smart Service Management System

## Step-by-Step Instructions to Fix IntelliJ IDEA Errors and Setup the Project

### Problem: Cannot resolve 'jakarta', 'lombok', and other dependencies

This happens because:
1. Maven dependencies haven't been downloaded yet
2. Annotation processing for Lombok is not enabled in IntelliJ
3. Project hasn't been built yet

### Solution:

## Part 1: Enable Lombok Annotation Processing in IntelliJ IDEA

**This is the MOST IMPORTANT step!**

1. Open IntelliJ IDEA
2. Go to: **File** → **Settings** (or **Ctrl+Alt+S**)
3. Navigate to: **Build, Execution, Deployment** → **Compiler** → **Annotation Processors**
4. ✅ Check the box: **Enable annotation processing**
5. Make sure these settings are correct:
   - Store generated sources relative to: **Module content root**
   - Production sources directory: **target/generated-sources/annotations**
   - Test sources directory: **target/generated-test-sources/test-annotations**
6. Click **Apply** and **OK**

## Part 2: Install Lombok Plugin (If Not Already Installed)

1. Go to: **File** → **Settings** → **Plugins**
2. Search for: **Lombok**
3. If not installed, click **Install**
4. Restart IntelliJ IDEA if prompted

## Part 3: Reload Maven Project

1. Look for the **Maven** tool window (usually on the right side of IntelliJ)
   - If not visible: **View** → **Tool Windows** → **Maven**
2. In the Maven window, click the **Reload All Maven Projects** button (circular arrows icon)
   - This will download all dependencies from the internet
   - **Be patient!** This can take 5-15 minutes depending on your internet speed
3. Wait until you see "BUILD SUCCESS" or the progress bar completes

## Part 4: Build the Project

1. Go to: **Build** → **Build Project** (or press **Ctrl+F9**)
2. Wait for the build to complete
3. Check the **Build** tool window at the bottom for any errors

## Part 5: Verify the Fix

1. Open any file with errors (like `RegisterRequest.java`)
2. All red underlines should be gone
3. Imports should now be recognized
4. You should see Lombok-generated methods (getters/setters) in the code structure

---

## Alternative: Command Line Build (If Maven is Installed)

If you have Maven installed on your system:

```bash
# Navigate to project directory
cd "E:\Smart service management\smartcart"

# Clean and build
mvn clean install -DskipTests

# Run the application
mvn spring-boot:run
```

## Alternative: Using Maven Wrapper (Recommended)

We've added Maven Wrapper to the project. Use these commands:

**Windows:**
```cmd
.\mvnw.cmd clean install -DskipTests
.\mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

---

## Part 6: Database Setup

1. Install MySQL 8.0+ if not already installed
   - Download from: https://dev.mysql.com/downloads/mysql/

2. Create the database:
   ```sql
   CREATE DATABASE smartcart;
   ```

3. Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smartcart
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

---

## Part 7: Configure External Services

### 7.1 Cloudinary Setup (for image uploads)

1. Sign up at: https://cloudinary.com/
2. Get your credentials from the Dashboard
3. Update `application.properties`:
   ```properties
   cloudinary.cloud-name=your_cloud_name
   cloudinary.api-key=your_api_key
   cloudinary.api-secret=your_api_secret
   ```

### 7.2 Razorpay Setup (for payments)

1. Sign up at: https://razorpay.com/
2. Get test credentials from the Dashboard
3. Update `application.properties`:
   ```properties
   razorpay.key.id=your_key_id
   razorpay.key.secret=your_key_secret
   ```

### 7.3 JWT Secret

Generate a strong secret key (minimum 256 bits):
```properties
jwt.secret=your_super_secret_jwt_key_here_minimum_256_bits
jwt.expiration=86400000
```

---

## Part 8: Frontend Setup

1. Open a new terminal
2. Navigate to frontend directory:
   ```bash
   cd "E:\Smart service management\smartcart\frontend"
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Create `.env` file in `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

5. Start the frontend:
   ```bash
   npm run dev
   ```

---

## Part 9: Git Repository Setup and Push to GitHub

### 9.1 Install Git (if not already installed)

Download and install Git from: https://git-scm.com/download/win

### 9.2 Initialize and Push to GitHub

```bash
# Navigate to project directory
cd "E:\Smart service management\smartcart"

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Smart Service Management System"

# Add remote repository
git remote add origin https://github.com/gowtham6477/smart-cart.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** If you get an authentication error, you may need to:
1. Set up a Personal Access Token on GitHub
2. Use: `git remote set-url origin https://YOUR_TOKEN@github.com/gowtham6477/smart-cart.git`

---

## Part 10: Running the Complete Application

### Terminal 1: Backend
```bash
cd "E:\Smart service management\smartcart"
.\mvnw.cmd spring-boot:run
```
Backend will run on: http://localhost:8080

### Terminal 2: Frontend
```bash
cd "E:\Smart service management\smartcart\frontend"
npm run dev
```
Frontend will run on: http://localhost:5173

---

## Troubleshooting

### Issue 1: "Cannot resolve symbol 'jakarta'"
**Fix:** Enable annotation processing and reload Maven (see Part 1-3 above)

### Issue 2: "Cannot resolve symbol 'lombok'"
**Fix:** Install Lombok plugin and enable annotation processing (see Part 1-2 above)

### Issue 3: Maven build fails
**Fix:** 
- Check internet connection (Maven needs to download dependencies)
- Delete `.m2/repository` folder and try again
- Use: `mvn clean install -U` to force update

### Issue 4: Port 8080 already in use
**Fix:** 
- Find and stop the process using port 8080
- Or change port in `application.properties`: `server.port=8081`

### Issue 5: Database connection error
**Fix:**
- Ensure MySQL is running
- Verify database name, username, and password in `application.properties`
- Create the database: `CREATE DATABASE smartcart;`

### Issue 6: Frontend can't connect to backend
**Fix:**
- Ensure backend is running on port 8080
- Check CORS configuration in `SecurityConfig.java`
- Verify `VITE_API_BASE_URL` in frontend `.env` file

---

## Summary of Files Modified

1. ✅ `pom.xml` - Added Maven compiler plugin with Lombok annotation processor
2. ✅ `.gitignore` - Added comprehensive ignore patterns
3. ✅ `.mvn/wrapper/` - Added Maven wrapper for easy building
4. ✅ `README.md` - Complete project documentation
5. ✅ `SETUP_GUIDE.md` - This detailed setup guide

---

## Next Steps After Setup

1. Create admin user in database
2. Add services and packages via admin API
3. Create employee accounts
4. Test customer booking flow
5. Configure Razorpay test mode
6. Test image uploads with Cloudinary

---

## Need Help?

If you encounter any issues:
1. Check the console/terminal for error messages
2. Verify all configuration in `application.properties`
3. Ensure all services (MySQL, backend, frontend) are running
4. Check IntelliJ IDEA's "Problems" or "Build" window for details

**Good luck! 🚀**

