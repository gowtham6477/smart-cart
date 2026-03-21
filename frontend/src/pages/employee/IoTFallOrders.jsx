import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { iotAPI } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function IoTFallOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await iotAPI.getSecondAttemptOrders();
      setOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to load IoT fall orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const employeeOrders = useMemo(() => {
    if (!user?.id) return orders;
    return orders.filter((order) => order.employeeId === user.id);
  }, [orders, user]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading IoT fall orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <h1 className="text-3xl font-bold text-gray-900">IoT Fall Orders</h1>
      </div>

      {employeeOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-600">No IoT fall orders assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employeeOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-sm font-semibold text-primary-600">
                  {order.orderNumber}
                </div>
                <span className="text-xs font-semibold text-red-600">FALL DETECTED</span>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-gray-500">{order.deliveryAddress}</p>
              </div>
              <button
                onClick={() => navigate(`/employee/replacements?orderId=${order.id}`)}
                className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm"
              >
                Create Replacement
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
