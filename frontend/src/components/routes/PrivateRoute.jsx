import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;

