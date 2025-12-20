import apiClient from '../lib/apiClient';

// Auth APIs
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Services APIs
export const servicesAPI = {
  getAll: (params) => apiClient.get('/services', { params }),
  getById: (id) => apiClient.get(`/services/${id}`),
  getByCategory: (category) => apiClient.get(`/services/category/${category}`),
  getPackages: (serviceId) => apiClient.get(`/services/${serviceId}/packages`),
};

// Customer Booking APIs
export const customerAPI = {
  createBooking: (data) => apiClient.post('/customer/bookings', data),
  getBookings: (params) => apiClient.get('/customer/bookings', { params }),
  getBookingById: (id) => apiClient.get(`/customer/bookings/${id}`),
  addFeedback: (id, data) => apiClient.post(`/customer/bookings/${id}/feedback`, data),

  // Payments
  createPaymentOrder: (bookingId) => apiClient.post('/customer/payments/create-order', { bookingId }),
  verifyPayment: (data) => apiClient.post('/customer/payments/verify', data),

  // Coupons
  validateCoupon: (code, amount) => apiClient.post('/customer/coupons/validate', { code, amount }),
};

// Employee APIs
export const employeeAPI = {
  getBookings: (params) => apiClient.get('/employee/bookings', { params }),
  updateBookingStatus: (id, status) => apiClient.put(`/employee/bookings/${id}/status`, { status }),
  uploadImage: (id, formData) => apiClient.post(`/employee/bookings/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  checkIn: () => apiClient.post('/employee/attendance/checkin'),
  checkOut: () => apiClient.post('/employee/attendance/checkout'),
};

// Admin APIs
export const adminAPI = {
  // Services
  createService: (data) => apiClient.post('/admin/services', data),
  updateService: (id, data) => apiClient.put(`/admin/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/admin/services/${id}`),

  // Packages
  createPackage: (data) => apiClient.post('/admin/packages', data),
  updatePackage: (id, data) => apiClient.put(`/admin/packages/${id}`, data),
  deletePackage: (id) => apiClient.delete(`/admin/packages/${id}`),

  // Employees
  getEmployees: (params) => apiClient.get('/admin/employees', { params }),
  createEmployee: (data) => apiClient.post('/admin/employees', data),
  updateEmployee: (id, data) => apiClient.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id) => apiClient.delete(`/admin/employees/${id}`),

  // Bookings
  getAllBookings: (params) => apiClient.get('/admin/bookings', { params }),
  assignBooking: (bookingId, employeeId) => apiClient.put(`/admin/bookings/${bookingId}/assign/${employeeId}`),

  // Coupons
  getCoupons: (params) => apiClient.get('/admin/coupons', { params }),
  createCoupon: (data) => apiClient.post('/admin/coupons', data),
  updateCoupon: (id, data) => apiClient.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => apiClient.delete(`/admin/coupons/${id}`),

  // Payments & Reports
  getPayments: (params) => apiClient.get('/admin/payments', { params }),
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
};

// IoT APIs (Optional)
export const iotAPI = {
  getEvents: (params) => apiClient.get('/iot/events', { params }),
  getAlerts: () => apiClient.get('/iot/alerts'),
};

