import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import Home from '../../pages/customer/Home';

const HomeRedirect = () => {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Home />;
  }

  const role = user?.role?.toUpperCase();

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (role === 'EMPLOYEE') {
    return <Navigate to="/employee" replace />;
  }

  return <Home />;
};

export default HomeRedirect;