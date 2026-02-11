import { useState, useEffect } from 'react';
import {
  Calendar, User, Phone, MapPin, Package, DollarSign,
  Clock, Filter, Search, UserPlus, Eye, CheckCircle, XCircle
} from 'lucide-react';
import { adminAPI, employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BOOKING_STATUS = {
  CREATED: { label: 'Created', color: 'bg-gray-100 text-gray-700' },
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  ASSIGNED: { label: 'Assigned', color: 'bg-purple-100 text-purple-700' },
  ACCEPTED: { label: 'Accepted', color: 'bg-indigo-100 text-indigo-700' },
  ON_THE_WAY: { label: 'On The Way', color: 'bg-cyan-100 text-cyan-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-orange-100 text-orange-700' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningEmployee, setAssigningEmployee] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, employeesRes] = await Promise.all([
        adminAPI.getAllBookings(),
        employeeAPI.getAll()
      ]);
      setBookings(bookingsRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmployee = async (bookingId, employeeId) => {
    try {
      await adminAPI.assignBooking(bookingId, employeeId);
      toast.success('Employee assigned successfully!');
      setShowAssignModal(false);
      setSelectedBooking(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign employee');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
        <p className="text-gray-600">View and manage all customer bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Bookings" value={bookings.length} color="blue" />
        <StatCard
          label="Pending"
          value={bookings.filter(b => b.status === 'PENDING' || b.status === 'CREATED').length}
          color="yellow"
        />
        <StatCard
          label="In Progress"
          value={bookings.filter(b => b.status === 'IN_PROGRESS' || b.status === 'ASSIGNED').length}
          color="purple"
        />
        <StatCard
          label="Completed"
          value={bookings.filter(b => b.status === 'COMPLETED').length}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by booking number, customer, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              {Object.keys(BOOKING_STATUS).map(status => (
                <option key={status} value={status}>{BOOKING_STATUS[status].label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bookings found</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onAssign={() => {
                setSelectedBooking(booking);
                setShowAssignModal(true);
              }}
              onView={() => setSelectedBooking(booking)}
            />
          ))
        )}
      </div>

      {/* Assign Employee Modal */}
      {showAssignModal && selectedBooking && (
        <AssignEmployeeModal
          booking={selectedBooking}
          employees={employees.filter(e => e.status === 'ACTIVE')}
          onAssign={handleAssignEmployee}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* View Booking Modal */}
      {selectedBooking && !showAssignModal && (
        <ViewBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAssign={() => setShowAssignModal(true)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}

function BookingCard({ booking, onAssign, onView }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{booking.bookingNumber}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${BOOKING_STATUS[booking.status]?.color}`}>
              {BOOKING_STATUS[booking.status]?.label}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {new Date(booking.bookingDate).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Customer</p>
            <p className="font-semibold text-gray-900">{booking.customerName}</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {booking.customerMobile}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Service</p>
            <p className="font-semibold text-gray-900">{booking.serviceName}</p>
            {booking.packageName && (
              <p className="text-sm text-gray-600">{booking.packageName}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="font-semibold text-gray-900">₹{booking.finalAmount}</p>
          </div>
        </div>
      </div>

      {booking.address && (
        <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Address</p>
            <p className="text-sm text-gray-700">
              {booking.address}, {booking.city}, {booking.state} - {booking.pincode}
            </p>
          </div>
        </div>
      )}

      {booking.employeeName && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-blue-600">Assigned to</p>
            <p className="font-semibold text-gray-900">{booking.employeeName}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onView}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        {!booking.employeeId && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <button
            onClick={onAssign}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Assign Employee
          </button>
        )}
      </div>
    </div>
  );
}

function AssignEmployeeModal({ booking, employees, onAssign, onClose }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign Employee</h2>
              <p className="text-gray-600">Booking: {booking.bookingNumber}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {employees.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active employees available</p>
            ) : (
              employees.map(employee => (
                <div
                  key={employee.id}
                  onClick={() => setSelectedEmployee(employee.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedEmployee === employee.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.employeeId} • {employee.role}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          employee.onlineStatus === 'ONLINE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {employee.onlineStatus}
                        </span>
                        {employee.tasksToday !== undefined && (
                          <span className="text-xs text-gray-600">
                            {employee.tasksToday} tasks today
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedEmployee === employee.id && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedEmployee && onAssign(booking.id, selectedEmployee)}
            disabled={!selectedEmployee}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Employee
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewBookingModal({ booking, onClose, onAssign }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{booking.bookingNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${BOOKING_STATUS[booking.status]?.color}`}>
                {BOOKING_STATUS[booking.status]?.label}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{booking.customerMobile}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{booking.serviceName}</p>
              </div>
              {booking.packageName && (
                <div>
                  <p className="text-sm text-gray-500">Package</p>
                  <p className="font-medium">{booking.packageName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-lg">₹{booking.finalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled Date</p>
                <p className="font-medium">{new Date(booking.scheduledDate || booking.bookingDate).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {booking.address && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <p className="text-gray-700">
                {booking.address}, {booking.city}, {booking.state} - {booking.pincode}
              </p>
            </div>
          )}

          {booking.employeeName && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Assigned Employee</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium">{booking.employeeName}</p>
                <p className="text-sm text-gray-600">{booking.employeeMobile}</p>
              </div>
            </div>
          )}

          {booking.specialInstructions && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Special Instructions</h3>
              <p className="text-gray-700">{booking.specialInstructions}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Close
          </button>
          {!booking.employeeId && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <button
              onClick={onAssign}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Assign Employee
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

