import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const RoleRoute = ({ role, children }) => {
  const { isAuthenticated, hasRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!hasRole(role)) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

export default RoleRoute;

