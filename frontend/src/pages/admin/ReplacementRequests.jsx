import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, RotateCcw, UserPlus } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function ReplacementRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [assignModal, setAssignModal] = useState({ open: false, request: null });
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getReplacementRequests(filter ? { status: filter } : undefined);
      setRequests(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load replacement requests');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await adminAPI.getEmployees();
      setEmployees(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };


  useEffect(() => {
    loadRequests();
  }, [filter]);

  useEffect(() => {
    loadEmployees();
  }, []);


  const handleReview = async (requestId, status) => {
    const note = window.prompt('Add a note (optional)') || '';
    try {
      await adminAPI.reviewReplacementRequest(requestId, { status, note });
      toast.success(`Request ${status.toLowerCase()}`);
      await loadRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update request');
    }
  };

  const handleRefund = async (request) => {
    try {
      await adminAPI.updateOrderStatus(request.orderId, 'REFUNDED');
      await adminAPI.reviewReplacementRequest(request.id, { status: 'REJECTED', note: 'Refunded by admin' });
      toast.success('Order refunded');
      await loadRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to refund order');
    }
  };

  const handleOpenAssign = (request) => {
    setAssignModal({ open: true, request });
    setSelectedEmployee(request?.employeeId || '');
  };

  const handleAssign = async () => {
    if (!assignModal.request || !selectedEmployee) {
      toast.error('Select an employee');
      return;
    }
    try {
      await adminAPI.assignOrder(assignModal.request.orderId, selectedEmployee);
      toast.success('Order reassigned');
      setAssignModal({ open: false, request: null });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reassign order');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading replacement requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Replacement Requests</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All statuses</option>
            <option value="PENDING_APPROVAL">Pending approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="APPLIED">Applied</option>
          </select>
          <Link
            to="/admin/replacements/settings"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Policy Settings
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Original Item</th>
              <th className="px-4 py-3 text-left">Replacement</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  No replacement requests found.
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
                  <div className="font-medium text-gray-900">{request.employeeName}</div>
                  <div className="text-xs text-gray-500">{request.employeeId}</div>
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
                <td className="px-4 py-3">
                  {request.status === 'PENDING_APPROVAL' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(request.id, 'APPROVED')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(request.id, 'REJECTED')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => handleRefund(request)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs"
                      >
                        <RotateCcw className="w-4 h-4" /> Refund
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleRefund(request)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs"
                      >
                        <RotateCcw className="w-4 h-4" /> Refund
                      </button>
                      <button
                        onClick={() => handleOpenAssign(request)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                      >
                        <UserPlus className="w-4 h-4" /> Reassign
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Reassign Order</h2>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setAssignModal({ open: false, request: null })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
