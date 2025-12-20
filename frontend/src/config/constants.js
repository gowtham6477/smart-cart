// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

// Razorpay
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// App Config
export const APP_NAME = 'SmartCart';
export const APP_DESCRIPTION = 'Smart Service Management System';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const DEBOUNCE_DELAY = 300;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Booking Status
export const BOOKING_STATUS = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  ON_THE_WAY: 'ON_THE_WAY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const STATUS_COLORS = {
  CREATED: 'gray',
  PENDING: 'yellow',
  CONFIRMED: 'blue',
  ASSIGNED: 'indigo',
  ACCEPTED: 'purple',
  ON_THE_WAY: 'cyan',
  IN_PROGRESS: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
};

