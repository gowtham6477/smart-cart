import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Stores
import useAuthStore from './stores/authStore';

// Layout
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import Home from './pages/customer/Home';
import ServiceList from './pages/customer/ServiceList';
import ServiceDetail from './pages/customer/ServiceDetail';
import MyBookings from './pages/customer/MyBookings';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeBookings from './pages/employee/Bookings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminEmployees from './pages/admin/Employees';
import AdminBookings from './pages/admin/Bookings';
import AdminCoupons from './pages/admin/Coupons';
import AdminPayments from './pages/admin/Payments';

// Components
import PrivateRoute from './components/routes/PrivateRoute';
import RoleRoute from './components/routes/RoleRoute';
import NotFound from './pages/NotFound';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { initAuth } = useAuthStore();

  // Initialize auth on app load
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes - Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
          </Route>

          {/* Public Routes - Customer */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
          </Route>

          {/* Protected Customer Routes */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/my/bookings" element={<MyBookings />} />
          </Route>

          {/* Employee Routes */}
          <Route element={<RoleRoute role="EMPLOYEE"><AppLayout /></RoleRoute>}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/bookings" element={<EmployeeBookings />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<RoleRoute role="ADMIN"><AppLayout /></RoleRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;

