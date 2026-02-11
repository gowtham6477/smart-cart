import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Loader2, ChevronLeft, ChevronRight, X, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { servicesAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import NotificationBell from '../../components/NotificationBell';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const ordersPerPage = 10;

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [servicesRes, ordersRes] = await Promise.all([
          servicesAPI.getAll(),
          adminAPI.getAllOrders().catch(() => ({ data: { data: [] } })),
        ]);

        const services = servicesRes.data.data || [];
        const allOrders = ordersRes.data.data || [];

        const revenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const customers = new Set(allOrders.map(o => o.customerId)).size;

        setStats({
          totalProducts: services.length,
          totalOrders: allOrders.length,
          totalRevenue: revenue,
          totalCustomers: customers,
        });

        // Sort orders by creation date (newest first)
        setOrders(allOrders.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        ));
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
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

      // Update selected order if viewing
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

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-indigo-100 text-indigo-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-cyan-100 text-cyan-700',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your platform.</p>
        </div>
        <NotificationBell userType="admin" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">${stats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <Package className="w-5 h-5 text-primary-600" />
              <div>
                <div className="font-semibold text-gray-900">Manage Products</div>
                <div className="text-sm text-gray-600">View and edit all services</div>
              </div>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">View Orders</div>
                <div className="text-sm text-gray-600">Monitor all bookings</div>
              </div>
            </Link>
            <Link
              to="/admin/coupons"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">Manage Coupons</div>
                <div className="text-sm text-gray-600">Create promotional offers</div>
              </div>
            </Link>
            <Link
              to="/admin/employees"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">Manage Employees</div>
                <div className="text-sm text-gray-600">View staff members</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Active Products</div>
                <div className="text-sm text-gray-600">Currently available</div>
              </div>
              <div className="text-2xl font-bold text-primary-600">{stats.totalProducts}</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Pending Orders</div>
                <div className="text-sm text-gray-600">Awaiting processing</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Delivered Orders</div>
                <div className="text-sm text-gray-600">Successfully fulfilled</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Refunded Orders</div>
                <div className="text-sm text-gray-600">Payment refunded</div>
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {orders.filter(o => o.status === 'REFUNDED').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <p className="text-gray-600">Latest orders and their status</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
          >
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleViewDetails(order)}>
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-semibold text-primary-600">
                          {order.orderNumber || order.id?.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customerEmail || order.customerMobile || ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {order.items?.length || 0} item(s)
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="text-xs text-gray-500">
                            {order.items[0].productName}
                            {order.items.length > 1 && ` +${order.items.length - 1} more`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="text-xs text-green-600">
                            -${order.discountAmount.toFixed(2)} saved
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status?.replace('_', ' ') || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                        >
                          View
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal - Same as in Orders.jsx */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-600 mt-1">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Order Status</label>
                <select
                  value={selectedOrder.status || 'PENDING'}
                  onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                  disabled={updatingStatus}
                  className={`w-full px-4 py-3 rounded-lg font-semibold text-sm ${getStatusColor(selectedOrder.status)} border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

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
                    <p className="font-semibold text-gray-900">{selectedOrder.customerMobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Delivery Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{selectedOrder.deliveryAddress || 'N/A'}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedOrder.city && `${selectedOrder.city}, `}
                    {selectedOrder.state && `${selectedOrder.state} `}
                    {selectedOrder.pincode || ''}
                  </p>
                </div>
              </div>

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

              {selectedOrder.customerNote && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Note</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedOrder.customerNote}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowDetailModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
