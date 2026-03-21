import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;

