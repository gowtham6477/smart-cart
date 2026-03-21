import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, ShoppingBag, X, Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, Phone, MapPin, RefreshCw, AlertTriangle, RotateCcw } from 'lucide-react';
import { workerAPI, iotAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  { value: 'ASSIGNED', label: 'Assigned', color: 'bg-purple-100 text-purple-700', icon: Clock },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-cyan-100 text-cyan-700', icon: Truck },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700', icon: Truck },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  { value: 'DAMAGED', label: 'Damaged', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  { value: 'RETURNING_TO_HUB', label: '⚠️ Return to Hub', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  { value: 'AWAITING_REPLACEMENT', label: 'Awaiting Replacement', color: 'bg-yellow-100 text-yellow-700', icon: RotateCcw },
];

export default function EmployeeOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeFilter, setActiveFilter] = useState('pending');

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await workerAPI.getOrders();
      console.log('Employee orders response:', res.data);
  const rawOrders = res.data.data || [];
  const byId = Array.from(new Map(rawOrders.map(order => [order.id, order])).values());
  const uniqueOrders = Array.from(new Map(byId.map(order => [order.orderNumber || order.id, order])).values());
  setOrders(uniqueOrders);
      setError(null);
    } catch (err) {
      console.error('Failed to load orders:', err);
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to load orders';
      setError(errorMsg);
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

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await workerAPI.updateOrderStatus(orderId, newStatus);
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

  // Handle "Returned to Hub" action after fall incident
  const handleReturnedToHub = async (orderId) => {
    setUpdatingStatus(true);
    try {
      const reason = window.prompt('Enter reason for returning to hub (fall incident):');
      if (reason === null) {
        setUpdatingStatus(false);
        return;
      }

      if (!reason.trim()) {
        toast.error('Return reason is required');
        setUpdatingStatus(false);
        return;
      }

      await iotAPI.markReturnedToHub(orderId, reason.trim());
      toast.success('Order marked as returned to hub. Replacement will be prepared.');
      
      // Update local state
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: 'AWAITING_REPLACEMENT' } : o
      ));

      // Update selected order if it's the one being viewed
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'AWAITING_REPLACEMENT' });
      }

      // Reload orders to get fresh data
      loadOrders();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to mark as returned';
      toast.error(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusConfig = (status) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const getGoogleMapsUrl = (order) => {
    const address = `${order.deliveryAddress || ''} ${order.city || ''} ${order.state || ''} ${order.pincode || ''} India`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const pendingStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'ASSIGNED', 'SHIPPED', 'OUT_FOR_DELIVERY'];
  const completedStatuses = ['DELIVERED'];
  const damagedStatuses = ['RETURNING_TO_HUB', 'DAMAGED'];
  const replacementStatuses = ['AWAITING_REPLACEMENT'];

  const filterDefinitions = [
    {
      key: 'pending',
      label: 'Pending',
      predicate: (order) => pendingStatuses.includes(order.status),
    },
    {
      key: 'completed',
      label: 'Completed',
      predicate: (order) => completedStatuses.includes(order.status),
    },
    {
      key: 'damaged',
      label: 'Damaged',
      predicate: (order) => damagedStatuses.includes(order.status),
    },
    {
      key: 'replacement',
      label: 'Replacement',
      predicate: (order) => replacementStatuses.includes(order.status) && !order.returnToHubReason,
    },
    {
      key: 'returned',
      label: 'Returned to Hub',
      predicate: (order) => replacementStatuses.includes(order.status) && !!order.returnToHubReason,
    },
  ];

  const activeFilterDef = filterDefinitions.find((filter) => filter.key === activeFilter);
  const filteredOrders = activeFilterDef ? orders.filter(activeFilterDef.predicate) : orders;

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error && orders.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders assigned</h3>
          <p className="text-gray-600">Orders assigned to you will appear here.</p>
        </div>
      </div>
    );
  }

  const statusConfig = selectedOrder ? getStatusConfig(selectedOrder.status) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Orders assigned to you for delivery</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold text-gray-900">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterDefinitions.map((filter) => {
          const count = orders.filter(filter.predicate).length;
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className={`ml-2 text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No orders in this category</p>
          <p className="text-sm text-gray-500">Try another filter to view more orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
          const statusInfo = getStatusConfig(order.status);
          const StatusIcon = statusInfo.icon;
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm font-semibold text-primary-600">
                    {order.orderNumber || 'N/A'}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Customer Info with Call & Map Links */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-900">{order.customerName || 'Unknown'}</p>
                </div>

                {/* Phone - Clickable to Call */}
                {order.customerMobile && (
                  <a
                    href={`tel:+91${order.customerMobile}`}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">+91 {order.customerMobile}</span>
                    <span className="ml-auto text-xs text-green-600">Tap to call</span>
                  </a>
                )}

                {/* Address - Clickable to Open Maps */}
                {(order.deliveryAddress || order.city) && (
                  <a
                    href={getGoogleMapsUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                  >
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{order.deliveryAddress || 'N/A'}</p>
                      <p className="text-xs text-blue-600">
                        {order.city && `${order.city}, `}
                        {order.state && `${order.state} `}
                        {order.pincode || ''}
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 flex-shrink-0">Open Maps</span>
                  </a>
                )}

                {/* Order Items Summary */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Items ({order.items?.length || 0})</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate">{item.productName}</span>
                        <span className="text-gray-500">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <div className="text-primary-600 text-xs">+{order.items.length - 2} more items</div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-lg text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                {/* Show special UI for RETURNING_TO_HUB status */}
                {order.status === 'RETURNING_TO_HUB' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-700">⚠️ FALL DETECTED</p>
                        <p className="text-sm text-red-600">Return to hub immediately. Do not deliver.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReturnedToHub(order.id)}
                        disabled={updatingStatus}
                        className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <RotateCcw className="w-5 h-5" />
                        {updatingStatus ? 'Processing...' : 'Returned to Hub'}
                      </button>
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ) : order.status === 'AWAITING_REPLACEMENT' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <RotateCcw className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                      <p className="font-semibold text-yellow-700">Awaiting Replacement</p>
                      <p className="text-sm text-yellow-600">Admin will reassign once replacement is ready</p>
                      {order.returnToHubReason && (
                        <p className="text-xs text-yellow-700 mt-2">Reason: {order.returnToHubReason}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status || 'ASSIGNED'}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingStatus}
                      className="flex-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {ORDER_STATUSES.filter(s => !['RETURNING_TO_HUB', 'AWAITING_REPLACEMENT'].includes(s.value)).map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-1"
                    >
                      Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-600">#{selectedOrder.orderNumber}</p>
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
              {/* Special Alert for FALL incident */}
              {selectedOrder.status === 'RETURNING_TO_HUB' && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-700">⚠️ FALL DETECTED</h3>
                      <p className="text-red-600">Product may be damaged. Return to hub immediately.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-gray-700 font-medium">Instructions:</p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                      <li>Do NOT deliver this product to the customer</li>
                      <li>Return to the hub with the product</li>
                      <li>Click "Returned to Hub" once you arrive</li>
                      <li>Admin will prepare a replacement</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleReturnedToHub(selectedOrder.id)}
                    disabled={updatingStatus}
                    className="w-full py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-6 h-6" />
                    {updatingStatus ? 'Processing...' : 'Returned to Hub'}
                  </button>
                </div>
              )}

              {selectedOrder.status === 'AWAITING_REPLACEMENT' && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                  <RotateCcw className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-yellow-700">Awaiting Replacement</h3>
                  <p className="text-yellow-600 mt-2">
                    This order is waiting for a replacement product. 
                    Admin will reassign once the replacement is ready.
                  </p>
                  {selectedOrder.returnToHubReason && (
                    <p className="text-sm text-yellow-700 mt-3">
                      Return reason: {selectedOrder.returnToHubReason}
                    </p>
                  )}
                  {selectedOrder.attemptCount && (
                    <p className="text-sm text-yellow-600 mt-2">
                      Delivery Attempt #{selectedOrder.attemptCount}
                    </p>
                  )}
                </div>
              )}

              {/* Status Update - Only show for normal statuses */}
              {!['RETURNING_TO_HUB', 'AWAITING_REPLACEMENT'].includes(selectedOrder.status) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update Status
                  </label>
                  <select
                    value={selectedOrder.status || 'ASSIGNED'}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-sm ${statusConfig?.color} border-2 border-gray-200`}
                  >
                    {ORDER_STATUSES.filter(s => !['RETURNING_TO_HUB', 'AWAITING_REPLACEMENT'].includes(s.value)).map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer Contact */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.customerName || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Phone Call Button */}
                  {selectedOrder.customerMobile && (
                    <a
                      href={`tel:+91${selectedOrder.customerMobile}`}
                      className="flex items-center justify-between bg-green-50 text-green-700 rounded-lg p-4 hover:bg-green-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-green-600">Phone Number</p>
                          <p className="font-bold text-lg">+91 {selectedOrder.customerMobile}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                        📞 Call Now
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Delivery Address with Map Link */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Delivery Address</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-900 font-medium">{selectedOrder.deliveryAddress || 'N/A'}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedOrder.city && `${selectedOrder.city}, `}
                    {selectedOrder.state && `${selectedOrder.state} `}
                    {selectedOrder.pincode || ''}
                  </p>
                  <a
                    href={getGoogleMapsUrl(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <MapPin className="w-5 h-5" />
                    Open in Google Maps
                  </a>
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
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-900">×{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                </div>
                {selectedOrder.customerNote && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Customer Note</p>
                    <p className="text-gray-700">{selectedOrder.customerNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

