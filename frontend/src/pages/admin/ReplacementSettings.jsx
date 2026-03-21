import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ReplacementSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    active: true,
    allowedCategories: '',
    maxPriceDiffPercent: 0,
    maxPriceDiffAmount: 0,
    timeWindowHours: 0,
    requireApproval: false,
    bufferEnabled: false,
    bufferQuantity: 0,
  });

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const res = await adminAPI.getReplacementPolicy();
        const policy = res.data.data;
        setForm({
          active: policy.active ?? true,
          allowedCategories: (policy.allowedCategories || []).join(', '),
          maxPriceDiffPercent: policy.maxPriceDiffPercent ?? 0,
          maxPriceDiffAmount: policy.maxPriceDiffAmount ?? 0,
          timeWindowHours: policy.timeWindowHours ?? 0,
          requireApproval: policy.requireApproval ?? false,
          bufferEnabled: policy.bufferEnabled ?? false,
          bufferQuantity: policy.bufferQuantity ?? 0,
        });
      } catch (error) {
        toast.error('Failed to load replacement policy');
      } finally {
        setLoading(false);
      }
    };

    loadPolicy();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        active: form.active,
        allowedCategories: form.allowedCategories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        maxPriceDiffPercent: Number(form.maxPriceDiffPercent),
        maxPriceDiffAmount: Number(form.maxPriceDiffAmount),
        timeWindowHours: Number(form.timeWindowHours),
        requireApproval: form.requireApproval,
        bufferEnabled: form.bufferEnabled,
        bufferQuantity: Number(form.bufferQuantity),
      };

      await adminAPI.updateReplacementPolicy(payload);
      toast.success('Replacement policy updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading replacement settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Replacement Settings</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Policy Status</h2>
            <p className="text-sm text-gray-500">Enable or disable replacements globally.</p>
          </div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm">Active</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Categories (comma-separated)
          </label>
          <input
            type="text"
            name="allowedCategories"
            value={form.allowedCategories}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Dairy, Grocery"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price Diff (%)</label>
            <input
              type="number"
              name="maxPriceDiffPercent"
              value={form.maxPriceDiffPercent}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price Diff (₹)</label>
            <input
              type="number"
              name="maxPriceDiffAmount"
              value={form.maxPriceDiffAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Window (hours)</label>
            <input
              type="number"
              name="timeWindowHours"
              value={form.timeWindowHours}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="requireApproval"
              checked={form.requireApproval}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Always require admin approval</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="bufferEnabled"
              checked={form.bufferEnabled}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable replacement buffer stock</span>
          </label>
        </div>

        {form.bufferEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Quantity</label>
            <input
              type="number"
              name="bufferQuantity"
              value={form.bufferQuantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
