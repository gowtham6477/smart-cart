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
  // Profile
  getProfile: () => apiClient.get('/customer/profile'),
  updateProfile: (data) => apiClient.put('/customer/profile', data),

  createBooking: (data) => apiClient.post('/customer/bookings', data),
  getBookings: (params) => apiClient.get('/customer/bookings', { params }),
  getBookingById: (id) => apiClient.get(`/customer/bookings/${id}`),
  addFeedback: (id, data) => apiClient.post(`/customer/bookings/${id}/feedback`, data),

  // Payments
  createPaymentOrder: (bookingId) => apiClient.post('/customer/payments/create-order', { bookingId }),
  verifyPayment: (data) => apiClient.post('/customer/payments/verify', data),

  // Coupons
  validateCoupon: (code, amount) => apiClient.post('/customer/coupons/validate', { code, amount }),
  getAvailableCoupons: () => apiClient.get('/customer/coupons/available'),

  // Cart
  getCart: () => apiClient.get('/customer/cart'),
  addToCart: (item) => apiClient.post('/customer/cart/add', item),
  removeFromCart: (serviceId) => apiClient.delete(`/customer/cart/remove/${serviceId}`),
  updateCartQuantity: (serviceId, quantity) => apiClient.put('/customer/cart/update', { serviceId, quantity }),
  clearCart: () => apiClient.delete('/customer/cart/clear'),

  // Orders
  createOrder: (data) => apiClient.post('/customer/orders', data),
  getOrders: (params) => apiClient.get('/customer/orders', { params }),
  getOrderById: (id) => apiClient.get(`/customer/orders/${id}`),

  // Wallet
  getWallet: () => apiClient.get('/customer/wallet'),
  getWalletBalance: () => apiClient.get('/customer/wallet/balance'),
  getWalletTransactions: (limit = 20) => apiClient.get('/customer/wallet/transactions', { params: { limit } }),
};

// Worker/Employee Portal APIs
export const workerAPI = {
  // Orders
  getOrders: () => apiClient.get('/employee/orders'),
  updateOrderStatus: (orderId, status) => apiClient.put(`/employee/orders/${orderId}/status`, { status }),

  // Bookings
  getBookings: (params) => apiClient.get('/employee/bookings', { params }),
  updateBookingStatus: (id, status) => apiClient.put(`/employee/bookings/${id}/status`, { status }),
  uploadImage: (id, formData) => apiClient.post(`/employee/bookings/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getBookingImages: (id) => apiClient.get(`/employee/bookings/${id}/images`),

  // Attendance
  checkIn: () => apiClient.post('/employee/attendance/checkin'),
  checkOut: () => apiClient.post('/employee/attendance/checkout'),
  getTodayAttendance: () => apiClient.get('/employee/attendance/today'),
  getAttendanceHistory: (params) => apiClient.get('/employee/attendance/history', { params }),

  // Tasks
  getTasks: (params) => apiClient.get('/employee/tasks', { params }),
  getTaskById: (id) => apiClient.get(`/employee/tasks/${id}`),
  acceptTask: (id) => apiClient.put(`/employee/tasks/${id}/accept`),
  updateTaskStatus: (id, status) => apiClient.put(`/employee/tasks/${id}/status`, { status }),
  uploadTaskImage: (id, formData) => apiClient.post(`/employee/tasks/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Dashboard
  getDashboardStats: () => apiClient.get('/employee/dashboard/stats'),

  // IoT Events
  getIoTEventsByEmployee: (employeeId) => apiClient.get(`/iot/events/employee/${employeeId}`),

  // Notifications
  getNotifications: () => apiClient.get('/employee/notifications'),
  getUnreadNotifications: () => apiClient.get('/employee/notifications/unread'),
  getUnreadCount: () => apiClient.get('/employee/notifications/unread-count'),
  markAsRead: (id) => apiClient.put(`/employee/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/employee/notifications/mark-all-read'),

  // Task Actions
  reportDamaged: (taskId) => apiClient.post(`/employee/tasks/${taskId}/report-damaged`),
  requestReplacement: (taskId) => apiClient.post(`/employee/tasks/${taskId}/request-replacement`),

  // Replacement flow
  validateReplacement: (data) => apiClient.post('/employee/replacements/validate', data),
  createReplacement: (data) => apiClient.post('/employee/replacements', data),
  getReplacements: () => apiClient.get('/employee/replacements'),
  confirmReplacement: (requestId) => apiClient.post(`/employee/replacements/${requestId}/confirm`),
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
  assignBooking: (bookingId, employeeId) => apiClient.post(`/admin/bookings/${bookingId}/assign/${employeeId}`),

  // Orders
  getAllOrders: (params) => apiClient.get('/admin/orders', { params }),
  updateOrderStatus: (orderId, status) => apiClient.put(`/admin/orders/${orderId}/status`, { status }),
  assignOrder: (orderId, employeeId) => apiClient.post(`/admin/orders/${orderId}/assign/${employeeId}`),

  // Coupons
  getCoupons: (params) => apiClient.get('/admin/coupons', { params }),
  createCoupon: (data) => apiClient.post('/admin/coupons', data),
  updateCoupon: (id, data) => apiClient.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => apiClient.delete(`/admin/coupons/${id}`),

  // Payments & Reports
  getPayments: (params) => apiClient.get('/admin/payments', { params }),
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),

  // Notifications
  getNotifications: () => apiClient.get('/admin/notifications'),
  getUnreadNotifications: () => apiClient.get('/admin/notifications/unread'),
  getUnreadCount: () => apiClient.get('/admin/notifications/unread-count'),
  markAsRead: (id) => apiClient.put(`/admin/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/admin/notifications/mark-all-read'),

  // Replacement flow
  getReplacementPolicy: () => apiClient.get('/admin/replacement-policy'),
  updateReplacementPolicy: (data) => apiClient.put('/admin/replacement-policy', data),
  getReplacementRequests: (params) => apiClient.get('/admin/replacements', { params }),
  reviewReplacementRequest: (requestId, data) => apiClient.post(`/admin/replacements/${requestId}/review`, data),

  // Inventory
  getInventory: () => apiClient.get('/admin/inventory'),
  updateInventory: (serviceId, data) => apiClient.put(`/admin/inventory/${serviceId}`, data),
};

// IoT APIs
export const iotAPI = {
  // ===== DEVICE MANAGEMENT =====
  // Get all registered devices
  getAllDevices: () => apiClient.get('/iot/devices'),
  
  // Get available devices (not assigned to any order)
  getAvailableDevices: () => apiClient.get('/iot/devices/available'),
  
  // Get device by ID
  getDevice: (deviceId) => apiClient.get(`/iot/devices/${deviceId}`),
  
  // Assign device to order
  assignDeviceToOrder: (deviceId, orderId) => apiClient.post(`/iot/devices/${deviceId}/assign/${orderId}`),
  
  // Release device from order
  releaseDevice: (orderId) => apiClient.post(`/iot/devices/release/${orderId}`),
  
  // Delete device
  deleteDevice: (deviceId) => apiClient.delete(`/iot/devices/${deviceId}`),
  
  // Get device statistics
  getDeviceStats: () => apiClient.get('/iot/devices/stats'),

  // ===== EVENT MANAGEMENT =====
  // Get all events
  getEvents: (params) => apiClient.get('/iot/events', { params }),
  
  // Get unacknowledged events
  getUnacknowledgedEvents: () => apiClient.get('/iot/events/unacknowledged'),
  
  // Get critical events
  getCriticalEvents: () => apiClient.get('/iot/events/critical'),
  
  // Get events by device
  getEventsByDevice: (deviceId) => apiClient.get(`/iot/events/device/${deviceId}`),
  
  // Get events by order
  getEventsByOrder: (orderId) => apiClient.get(`/iot/events/order/${orderId}`),
  
  // Get event statistics
  getStats: () => apiClient.get('/iot/events/stats'),
  
  // Acknowledge an event
  acknowledgeEvent: (eventId, userId) => apiClient.put(`/iot/events/${eventId}/acknowledge`, {}, {
    headers: { 'userId': userId }
  }),

  // ===== ORDER MANAGEMENT (Fall Recovery) =====
  // Device heartbeat (for ESP32)
  sendHeartbeat: (deviceId) => apiClient.post(`/iot/heartbeat/${deviceId}`),
  
  // Attach device to order (legacy)
  attachDeviceToOrder: (orderId, deviceId) => apiClient.post(`/iot/orders/${orderId}/attach-device`, { deviceId }),
  
  // Get orders that need second attempt (had fall incidents)
  getSecondAttemptOrders: () => apiClient.get('/iot/orders/second-attempt'),
  
  // Mark order as returned to hub after fall incident (Employee action)
  markReturnedToHub: (orderId, reason = null) => apiClient.post(`/iot/orders/${orderId}/returned-to-hub`, reason ? { reason } : {}),
  
  // Restart delivery after replacement is ready (Admin action)
  restartDelivery: (orderId) => apiClient.post(`/iot/orders/${orderId}/restart-delivery`),

  // ============= CLEANUP FUNCTIONS (Admin only) =============
  
  // Clear all IoT events from database
  clearAllEvents: () => apiClient.delete('/iot/events/clear-all'),
  
  // Reset all devices to available state
  resetAllDevices: () => apiClient.post('/iot/devices/reset-all'),
  
  // Clear IoT data from all orders
  clearIoTFromOrders: () => apiClient.post('/iot/orders/clear-iot'),
  
  // Full reset - clear all IoT related data
  fullReset: () => apiClient.post('/iot/full-reset'),
};

// Admin Employee Management APIs
export const employeeAPI = {
  // Get all employees
  getAll: () => apiClient.get('/admin/employees'),

  // Get employee by ID
  getById: (id) => apiClient.get(`/admin/employees/${id}`),

  // Create new employee
  create: (data) => apiClient.post('/admin/employees', data),

  // Update employee
  update: (id, data) => apiClient.put(`/admin/employees/${id}`, data),

  // Toggle employee status (active/suspended)
  toggleStatus: (id) => apiClient.put(`/admin/employees/${id}/toggle-status`),

  // Update online status
  updateOnlineStatus: (id, status) => apiClient.put(`/admin/employees/${id}/online-status`, { status }),

  // Delete employee
  delete: (id) => apiClient.delete(`/admin/employees/${id}`),

  // Generate username from name
  generateUsername: (name) => apiClient.get('/admin/employees/generate-username', { params: { name } }),
};

