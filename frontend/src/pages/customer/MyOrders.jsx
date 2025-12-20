import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, ShoppingBag, Package } from 'lucide-react';
import { customerAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getBookings();
      console.log('My orders response:', res.data);
      setOrders(res.data.data || []);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading your orders...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
          >
            <Package className="w-5 h-5" />
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-bold text-gray-900">{orders.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{order.serviceName}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-primary-50 text-primary-700'
                  }`}>
                    {order.status || 'PENDING'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Booking #{order.bookingNumber}</p>
                <p className="text-sm text-gray-600">{order.packageName}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${(order.finalPrice || order.originalPrice || 0).toFixed(2)}
                </div>
                <p className="text-sm text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500 mb-1">Service Address</p>
                <p className="text-sm font-medium text-gray-900">{order.serviceAddress || 'N/A'}</p>
                <p className="text-sm text-gray-600">{order.city}, {order.pincode}</p>
              </div>
              {order.scheduledDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Scheduled For</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(order.scheduledDate).toLocaleDateString()} at {order.serviceTime || 'TBD'}
                  </p>
                </div>
              )}
              {order.employeeName && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned Employee</p>
                  <p className="text-sm font-medium text-gray-900">{order.employeeName}</p>
                  <p className="text-sm text-gray-600">{order.employeeMobile}</p>
                </div>
              )}
              {order.customerNote && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Note</p>
                  <p className="text-sm text-gray-700">{order.customerNote}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
