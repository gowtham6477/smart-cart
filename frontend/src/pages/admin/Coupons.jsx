import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Loader2, AlertCircle, PlusCircle } from 'lucide-react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminAPI.getCoupons();
        setCoupons(res.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading coupons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Coupons</h1>
          <p className="text-gray-600">View existing coupons</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700">
          <PlusCircle className="w-5 h-5" />
          Add coupon (coming soon)
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center text-gray-600">
          No coupons yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-4 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wide">
            <div>Code</div>
            <div>Type</div>
            <div>Value</div>
            <div>Min Amount</div>
            <div>Usage Limit</div>
            <div>Status</div>
          </div>
          <div className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <div key={c.id} className="grid grid-cols-6 gap-4 px-4 py-3 text-sm">
                <div className="font-semibold text-gray-900">{c.code}</div>
                <div className="text-gray-700">{c.discountType}</div>
                <div className="text-gray-900 font-medium">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`}
                </div>
                <div className="text-gray-700">${c.minimumOrderAmount?.toFixed(2) ?? '0.00'}</div>
                <div className="text-gray-700">{c.usageLimit ?? '—'}</div>
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
