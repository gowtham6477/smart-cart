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

// Customer/Product Pages
import Home from './pages/customer/Home';
import ProductList from './pages/customer/ProductList';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeOrders from './pages/employee/Orders';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminEmployees from './pages/admin/Employees';
import AdminOrders from './pages/admin/Orders';
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
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/auth/register" element={<AuthLayout><Register /></AuthLayout>} />

          {/* Public Product Routes */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/products" element={<AppLayout><ProductList /></AppLayout>} />
          <Route path="/products/category/:category" element={<AppLayout><ProductList /></AppLayout>} />
          <Route path="/products/:id" element={<AppLayout><ProductDetail /></AppLayout>} />

          {/* Protected Customer Routes */}
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <AppLayout><Cart /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/my/orders"
            element={
              <PrivateRoute>
                <AppLayout><MyOrders /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <AppLayout><Profile /></AppLayout>
              </PrivateRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <RoleRoute role="EMPLOYEE">
                <AppLayout><EmployeeDashboard /></AppLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/employee/orders"
            element={
              <RoleRoute role="EMPLOYEE">
                <AppLayout><EmployeeOrders /></AppLayout>
              </RoleRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RoleRoute role="ADMIN">
                <AppLayout><AdminDashboard /></AppLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RoleRoute role="ADMIN">
                <AppLayout><AdminProducts /></AppLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <RoleRoute role="ADMIN">
                <AppLayout><AdminEmployees /></AppLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RoleRoute role="ADMIN">
                <AppLayout><AdminOrders /></AppLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <RoleRoute role="ADMIN">
                <AppLayout><AdminCoupons /></AppLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <RoleRoute role="ADMIN">
                <AppLayout><AdminPayments /></AppLayout>
              </RoleRoute>
            }
          />

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>

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

