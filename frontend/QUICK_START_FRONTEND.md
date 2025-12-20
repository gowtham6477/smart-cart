# 🚀 FRONTEND SETUP & RUN INSTRUCTIONS

## ✅ Current Status
- ✅ Package.json configured with all dependencies
- ✅ Tailwind CSS setup complete
- ✅ API client and services created
- ✅ State management (Zustand stores) ready
- ✅ Main App.jsx structure created
- ✅ Routing components ready

---

## 📦 STEP 1: Install All Dependencies

Open PowerShell and run:

```powershell
cd "E:\Smart service management\smartcart\frontend"
npm install
```

This will install approximately 40 packages including:
- React & React Router
- TanStack Query
- Axios
- Zustand
- React Hook Form + Zod
- Tailwind CSS
- Framer Motion
- Socket.IO Client
- And all other dependencies

**Time**: 2-5 minutes depending on your internet speed

---

## 🔧 STEP 2: Configure Environment

The `.env` file has been created. Update it with your values:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=your_actual_razorpay_key_id
VITE_SOCKET_URL=http://localhost:8080
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## 🎨 STEP 3: Create Remaining Components

The following structure needs to be completed. I've created the core files.
You can create the remaining files one by one as needed:

### Essential Files Already Created ✅
```
src/
├── config/constants.js ✅
├── lib/apiClient.js ✅
├── services/api.js ✅
├── stores/
│   ├── authStore.js ✅
│   └── cartStore.js ✅
├── components/routes/
│   ├── PrivateRoute.jsx ✅
│   └── RoleRoute.jsx ✅
├── index.css ✅ (Tailwind configured)
└── App.new.jsx ✅ (Routing setup)
```

### Files to Create (Copy templates from guide):

#### A. Layouts (Priority: HIGH)
```
src/components/layout/
├── AppLayout.jsx - Main layout wrapper with header/footer
├── AuthLayout.jsx - Clean layout for login/register
└── AppHeader.jsx - Navigation bar
```

#### B. Auth Pages (Priority: HIGH)
```
src/pages/auth/
├── Login.jsx - Login form
└── Register.jsx - Registration form
```

#### C. Customer Pages (Priority: MEDIUM)
```
src/pages/customer/
├── Home.jsx - Landing page
├── ServiceList.jsx - Browse services
├── ServiceDetail.jsx - Service details + booking
└── MyBookings.jsx - Track bookings
```

#### D. Employee Pages (Priority: MEDIUM)
```
src/pages/employee/
├── Dashboard.jsx - Employee dashboard
└── Bookings.jsx - Task management
```

#### E. Admin Pages (Priority: LOW - Can be done later)
```
src/pages/admin/
├── Dashboard.jsx
├── Services.jsx
├── Employees.jsx
├── Bookings.jsx
├── Coupons.jsx
└── Payments.jsx
```

#### F. Common Components (Create as needed)
```
src/components/common/
├── Button.jsx
├── Input.jsx
├── LoadingSpinner.jsx
├── Modal.jsx
└── Card.jsx
```

---

## 🏃 STEP 4: Replace App.jsx and Run

### Option A: Quick Start (Recommended)
```powershell
# 1. Replace App.jsx
cd "E:\Smart service management\smartcart\frontend\src"
Move-Item App.jsx App.old.jsx -Force
Move-Item App.new.jsx App.jsx -Force

# 2. Go back to frontend root
cd "E:\Smart service management\smartcart\frontend"

# 3. Start dev server
npm run dev
```

### Option B: Manual
1. Delete current `src/App.jsx`
2. Rename `src/App.new.jsx` to `src/App.jsx`
3. Run `npm run dev`

**Expected Output**:
```
VITE v5.0.11  ready in 2.5s

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🛠️ STEP 5: Create Missing Page Stubs

Create minimal stub pages to prevent errors:

### Create: `src/components/layout/AppLayout.jsx`
```jsx
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary-600">SmartCart</h1>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

### Create: `src/components/layout/AuthLayout.jsx`
```jsx
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Outlet />
    </div>
  );
}
```

### Create: `src/pages/auth/Login.jsx`
```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-primary-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
```

### Create: `src/pages/auth/Register.jsx`
```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mobile</label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="input"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
```

### Create stub pages for others:
```jsx
// src/pages/customer/Home.jsx
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">Welcome to SmartCart</h1>
      <p className="mt-4">Service booking platform</p>
    </div>
  );
}

// src/pages/customer/ServiceList.jsx
export default function ServiceList() {
  return <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold">Services</h1>
  </div>;
}

// Similar stubs for other pages...
```

### Create: `src/pages/NotFound.jsx`
```jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <Link to="/" className="mt-6 inline-block btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
```

---

## ✅ STEP 6: Verify Everything Works

After npm install and running `npm run dev`:

1. **Open browser**: http://localhost:5173
2. **You should see**: SmartCart homepage
3. **Test navigation**: Click Login/Register
4. **Check console**: No errors

---

## 🎯 Development Roadmap

### Phase 1: Get It Running (30 min)
- ✅ Install dependencies
- ✅ Create layout stubs
- ✅ Create auth pages
- ✅ Start dev server
- ✅ Verify login/register works

### Phase 2: Customer Flow (4-6 hours)
- Create ServiceList with API integration
- Create ServiceDetail with booking form
- Implement payment flow
- Create MyBookings page

### Phase 3: Employee Portal (3-4 hours)
- Create employee dashboard
- Implement task management
- Add image upload functionality

### Phase 4: Admin Panel (6-8 hours)
- Create admin dashboard with KPIs
- Implement CRUD for services/employees/coupons
- Add booking management
- Create reports

### Phase 5: Polish (4-6 hours)
- Real-time updates via Socket.IO
- Add loading states and skeletons
- Implement error handling
- Add animations
- Mobile responsiveness

**Total Estimated Time**: 20-30 hours

---

## 🐛 Troubleshooting

### Issue: "Module not found"
**Solution**: Run `npm install` again

### Issue: "CORS error"
**Solution**: Make sure backend is running and CORS is enabled

### Issue: Tailwind classes not working
**Solution**: Make sure you replaced index.css correctly

### Issue: Routes not working
**Solution**: Ensure all page components are created (even as stubs)

---

## 📚 Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/
- **TanStack Query**: https://tanstack.com/query/latest
- **Zustand**: https://docs.pmnd.rs/zustand
- **React Hook Form**: https://react-hook-form.com/

---

## 🎉 You're Ready!

Once you complete Step 4, your frontend will be running!

**Next Steps**:
1. Install dependencies (`npm install`)
2. Create the stub files above
3. Run dev server (`npm run dev`)
4. Start building out pages one by one

**Need Help?** Check `FRONTEND_IMPLEMENTATION_GUIDE.md` for complete details!


