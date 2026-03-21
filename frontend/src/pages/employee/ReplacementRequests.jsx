import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { workerAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function EmployeeReplacementRequests() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validation, setValidation] = useState(null);

  const [form, setForm] = useState({
    orderId: '',
    originalItemId: '',
    replacementProductId: '',
    replacementProductName: '',
    replacementCategory: '',
    replacementPrice: '',
    replacementQuantity: '',
    replacementImageUrl: '',
    reason: '',
  });

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === form.orderId),
    [orders, form.orderId]
  );

  const selectedItem = useMemo(
    () => selectedOrder?.items?.find((item) => item.itemId === form.originalItemId),
    [selectedOrder, form.originalItemId]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, requestsRes] = await Promise.all([
        workerAPI.getOrders(),
        workerAPI.getReplacements(),
      ]);
      const orderData = ordersRes.data.data || [];
      setOrders(orderData);
      setRequests(requestsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load replacement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      setForm((prev) => ({ ...prev, orderId }));
    }
  }, [searchParams]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      originalItemId: '',
      replacementProductId: '',
      replacementProductName: '',
      replacementCategory: '',
      replacementPrice: '',
      replacementQuantity: '',
      replacementImageUrl: '',
    }));
    setValidation(null);
  }, [form.orderId]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      replacementProductId: selectedItem.productId || '',
      replacementProductName: selectedItem.productName || '',
      replacementCategory: selectedItem.category || '',
      replacementPrice: selectedItem.price ?? '',
      replacementQuantity: selectedItem.quantity ?? '',
      replacementImageUrl: selectedItem.imageUrl || '',
    }));
    setValidation(null);
  }, [selectedItem?.itemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidate = async () => {
    if (!form.orderId || !form.originalItemId || !form.replacementProductName || !form.replacementCategory) {
      toast.error('Fill required fields first');
      return;
    }

    try {
      const payload = {
        ...form,
        replacementPrice: Number(form.replacementPrice || 0),
        replacementQuantity: Number(form.replacementQuantity || selectedItem?.quantity || 1),
      };
      const res = await workerAPI.validateReplacement(payload);
      setValidation(res.data.data);
      toast.success(res.data.data.allowed ? 'Replacement validated' : res.data.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Validation failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        replacementPrice: Number(form.replacementPrice || 0),
        replacementQuantity: Number(form.replacementQuantity || selectedItem?.quantity || 1),
      };
      await workerAPI.createReplacement(payload);
      toast.success('Replacement request submitted');
      setForm({
        orderId: '',
        originalItemId: '',
        replacementProductId: '',
        replacementProductName: '',
        replacementCategory: '',
        replacementPrice: '',
        replacementQuantity: '',
        replacementImageUrl: '',
        reason: '',
      });
      setValidation(null);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (requestId) => {
    try {
      await workerAPI.confirmReplacement(requestId);
      toast.success('Replacement applied');
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to apply replacement');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading replacements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Replacement Requests</h1>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Create replacement request</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              name="orderId"
              value={form.orderId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} - {order.customerName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Item</label>
            <select
              name="originalItemId"
              value={form.originalItemId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={!selectedOrder}
            >
              <option value="">Select item</option>
              {selectedOrder?.items?.map((item) => (
                <option key={item.itemId} value={item.itemId}>
                  {item.productName} (Qty: {item.quantity})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Product Name</label>
            <input
              type="text"
              name="replacementProductName"
              value={form.replacementProductName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Category</label>
            <input
              type="text"
              name="replacementCategory"
              value={form.replacementCategory}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Product ID</label>
            <input
              type="text"
              name="replacementProductId"
              value={form.replacementProductId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Price</label>
            <input
              type="number"
              name="replacementPrice"
              value={form.replacementPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Quantity</label>
            <input
              type="number"
              name="replacementQuantity"
              value={form.replacementQuantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={selectedItem?.quantity || 1}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows="3"
          />
        </div>

        {validation && (
          <div className={`rounded-lg p-3 text-sm ${validation.allowed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <div className="flex items-center gap-2">
              {validation.allowed ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{validation.message}</span>
            </div>
            {validation.allowed && (
              <div className="mt-2 text-xs text-gray-600">
                Price diff: ₹{validation.priceDifference?.toFixed?.(2) || validation.priceDifference}
                {' · '}Requires approval: {validation.requiresApproval ? 'Yes' : 'No'}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleValidate}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            Validate
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Requests</h2>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Original</th>
                <th className="px-4 py-3 text-left">Replacement</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    No replacement requests yet.
                  </td>
                </tr>
              )}
              {requests.map((request) => (
                <tr key={request.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{request.orderNumber}</div>
                    <div className="text-xs text-gray-500">{request.orderId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{request.originalItem?.productName}</div>
                    <div className="text-xs text-gray-500">Qty: {request.originalItem?.quantity}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{request.replacementItem?.productName}</div>
                    <div className="text-xs text-gray-500">Qty: {request.replacementItem?.quantity}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-700'}`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
