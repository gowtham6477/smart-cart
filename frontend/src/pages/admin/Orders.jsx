import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, ShoppingBag, X, Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, UserPlus, User, RefreshCw, Wifi, WifiOff, AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { adminAPI, employeeAPI, iotAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-cyan-100 text-cyan-700', icon: Truck },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700', icon: Truck },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  { value: 'RETURNING_TO_HUB', label: 'Returning to Hub', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  { value: 'AWAITING_REPLACEMENT', label: 'Awaiting Replacement', color: 'bg-purple-100 text-purple-700', icon: RotateCcw },
  { value: 'DAMAGED', label: 'Damaged', color: 'bg-red-100 text-red-700', icon: XCircle },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [replacementRequest, setReplacementRequest] = useState(null);
  const [replacementLoading, setReplacementLoading] = useState(false);

  useEffect(() => {
    loadOrders();
    loadEmployees();

    // Auto-refresh orders every 10 seconds to show real-time status updates
    const refreshInterval = setInterval(() => {
      loadOrders();
    }, 10000); // 10 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllOrders();
      console.log('Orders response:', res.data);
      const allOrders = res.data.data || [];
      const filteredOrders = allOrders.filter(order => !['RETURNING_TO_HUB', 'DAMAGED'].includes(order.status));
      setOrders(filteredOrders);
      setError(null);
    } catch (err) {
      console.error('Failed to load orders:', err);
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to load orders';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast.promise(
      loadOrders(),
      {
        loading: 'Refreshing orders...',
        success: 'Orders refreshed!',
        error: 'Failed to refresh'
      }
    );
  };

  const handleClearAllOrders = async () => {
    if (!confirm('⚠️ This will permanently delete ALL orders and related data. Continue?')) return;
    try {
      const response = await adminAPI.clearAllOrders();
      const result = response.data?.data || {};
      toast.success(`Orders cleared. Orders: ${result.ordersCleared ?? 0}, Tasks: ${result.tasksCleared ?? 0}`);
      await loadOrders();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to clear orders';
      toast.error(errorMsg);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    if (order?.status === 'AWAITING_REPLACEMENT') {
      loadReplacementRequest(order.id);
    } else {
      setReplacementRequest(null);
    }
  };

  const loadReplacementRequest = async (orderId) => {
    try {
      setReplacementLoading(true);
      const res = await adminAPI.getReplacementByOrder(orderId);
      setReplacementRequest(res.data.data || null);
    } catch (error) {
      console.error('Failed to load replacement request:', error);
      setReplacementRequest(null);
    } finally {
      setReplacementLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);

      // Update local state
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));

      // Update selected order if it's the one being viewed
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to update order status';
      toast.error(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignEmployee = async (employeeId) => {
    if (!assigningOrder) return;

    try {
      // Call the backend API to assign the employee to ORDER (not booking)
      await adminAPI.assignOrder(assigningOrder.id, employeeId);

      // Find the employee
      const employee = employees.find(e => e.id === employeeId);
      if (employee) {
        // Update local state to show assignment
        setOrders(orders.map(o =>
          o.id === assigningOrder.id
            ? { ...o, employeeId: employeeId, employeeName: employee.name, status: 'CONFIRMED' }
            : o
        ));
        toast.success(`Successfully assigned to ${employee.name}`);
      } else {
        toast.error('Employee not found');
      }
      setShowAssignModal(false);
      setAssigningOrder(null);

      // Reload orders to get latest data
      await loadOrders();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.response?.data?.message || 'Failed to assign employee');
    }
  };

  const openAssignModal = (order) => {
    setAssigningOrder(order);
    setShowAssignModal(true);
  };

  // Restart delivery for orders in AWAITING_REPLACEMENT status
  const handleRestartDelivery = async (orderId) => {
    try {
      setUpdatingStatus(true);
      await iotAPI.restartDelivery(orderId);
      toast.success('Delivery restarted! Employee and customer have been notified.');
      
      // Update local state
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: 'ASSIGNED' } : o
      ));

      // Reload orders to get latest data
      await loadOrders();
    } catch (error) {
      console.error('Restart delivery error:', error);
      toast.error(error.response?.data?.message || 'Failed to restart delivery');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusConfig = (status) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-semibold mb-2">Error loading orders</p>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={loadOrders}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Orders Management</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Orders will appear here once customers place them.</p>
        </div>
      </div>
    );
  }

  const statusConfig = selectedOrder ? getStatusConfig(selectedOrder.status) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleClearAllOrders}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2 transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Orders
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="text-sm text-gray-600">
            Total Orders: <span className="font-bold text-gray-900">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">IoT Device</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const statusInfo = getStatusConfig(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm font-semibold text-primary-600">
                        {order.orderNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{order.customerName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail || ''}</div>
                      {order.customerMobile && (
                        <div className="text-xs text-blue-600 mt-1">📱 +91 {order.customerMobile}</div>
                      )}
                      {order.deliveryAddress && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={order.deliveryAddress}>
                          📍 {order.deliveryAddress}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-left hover:text-primary-600 transition"
                      >
                        <div className="text-sm font-medium text-gray-900">{order.items?.length || 0} item(s)</div>
                        {order.items && order.items.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {order.items.slice(0, 1).map((item, idx) => (
                              <div key={idx}>{item.productName} ×{item.quantity}</div>
                            ))}
                            {order.items.length > 1 && <div className="text-primary-600">+{order.items.length - 1} more</div>}
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status || 'PENDING'}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingStatus}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer ${statusInfo.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      {order.isSecondAttempt && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                          <AlertTriangle className="w-3 h-3" />
                          2nd Attempt
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.iotDeviceId ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {order.iotDeviceActive ? (
                              <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-mono text-xs">{order.iotDeviceId}</span>
                          </div>
                          <span className={`text-xs ${order.iotDeviceActive ? 'text-green-600' : 'text-red-600'}`}>
                            {order.iotDeviceActive ? 'Active' : 'Offline'}
                          </span>
                          {order.totalOfflineMinutes > 0 && (
                            <span className="text-xs text-orange-500">
                              Offline: {order.totalOfflineMinutes}m total
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No device</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.employeeId ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.employeeName || 'Assigned'}</div>
                            <div className="text-xs text-gray-500">Employee</div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openAssignModal(order)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <UserPlus className="w-4 h-4" />
                          Assign
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="text-xs text-green-600">-${order.discountAmount.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                        >
                          Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        {/* Show Restart Delivery button for AWAITING_REPLACEMENT status */}
                        {order.status === 'AWAITING_REPLACEMENT' && (
                          <button
                            onClick={() => handleRestartDelivery(order.id)}
                            disabled={updatingStatus}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 flex items-center gap-1 disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restart Delivery
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-600 mt-1">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Alert for AWAITING_REPLACEMENT status */}
              {selectedOrder.status === 'AWAITING_REPLACEMENT' && (
                <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <RotateCcw className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-700">Awaiting Replacement</h3>
                      <p className="text-purple-600">This order had a fall incident. Prepare replacement and restart delivery.</p>
                    </div>
                  </div>
                  {selectedOrder.previousIncidentNote && (
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700">Incident Note:</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedOrder.previousIncidentNote}</p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      handleRestartDelivery(selectedOrder.id);
                      setShowDetailModal(false);
                    }}
                    disabled={updatingStatus}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                    {updatingStatus ? 'Restarting...' : 'Restart Delivery'}
                  </button>
                  <div className="mt-4 border-t border-purple-200 pt-4">
                    <p className="text-sm text-purple-700 font-semibold mb-2">Replacement Request</p>
                    {replacementLoading ? (
                      <p className="text-sm text-purple-600">Loading replacement request...</p>
                    ) : replacementRequest ? (
                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Status:</span> {replacementRequest.status}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Item:</span> {replacementRequest.replacementItem?.productName}
                        </p>
                        {replacementRequest.status === 'PENDING_APPROVAL' && (
                          <p className="text-xs text-purple-600">Approve this request from the Replacement Requests tab.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-purple-600">No replacement request found.</p>
                    )}
                  </div>
                  <p className="text-xs text-purple-600 text-center mt-2">
                    This will notify the employee and customer that delivery is resuming.
                  </p>
                </div>
              )}

              {/* Alert for RETURNING_TO_HUB status */}
              {selectedOrder.status === 'RETURNING_TO_HUB' && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-700">⚠️ Fall Detected - Returning to Hub</h3>
                      <p className="text-red-600">Employee is returning to hub with this order due to a fall incident.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={selectedOrder.status || 'PENDING'}
                  onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                  disabled={updatingStatus}
                  className={`w-full px-4 py-3 rounded-lg font-semibold text-sm ${statusConfig?.color} border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    {selectedOrder.customerMobile ? (
                      <a 
                        href={`tel:+91${selectedOrder.customerMobile}`}
                        className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-2"
                      >
                        📞 +91 {selectedOrder.customerMobile}
                      </a>
                    ) : (
                      <p className="font-semibold text-gray-900">N/A</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Delivery Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{selectedOrder.deliveryAddress || 'N/A'}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedOrder.city && `${selectedOrder.city}, `}
                    {selectedOrder.state && `${selectedOrder.state} `}
                    {selectedOrder.pincode || ''}
                  </p>
                  {(selectedOrder.deliveryAddress || selectedOrder.city) && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selectedOrder.deliveryAddress || ''} ${selectedOrder.city || ''} ${selectedOrder.state || ''} ${selectedOrder.pincode || ''} India`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      📍 Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">${item.price?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center text-gray-900">×{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>${(selectedOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                      <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>${(selectedOrder.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedOrder.customerNote && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Note</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedOrder.customerNote}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Assignment Modal */}
      {showAssignModal && assigningOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign Employee</h2>
                  <p className="text-gray-600">Order: {assigningOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssigningOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {employees.filter(e => e.status === 'ACTIVE').length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No active employees available</p>
                ) : (
                  employees
                    .filter(e => e.status === 'ACTIVE')
                    .map(employee => (
                      <button
                        key={employee.id}
                        onClick={() => handleAssignEmployee(employee.id)}
                        className="w-full p-4 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer transition text-left"
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
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssigningOrder(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
