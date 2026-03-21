import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { adminAPI, servicesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [inventory, setInventory] = useState({});
  const [savingId, setSavingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesRes, inventoryRes] = await Promise.all([
        servicesAPI.getAll(),
        adminAPI.getInventory(),
      ]);

      const serviceList = servicesRes.data.data || [];
      const inventoryList = inventoryRes.data.data || [];
      const inventoryMap = inventoryList.reduce((acc, item) => {
        acc[item.serviceId] = item;
        return acc;
      }, {});

      setServices(serviceList);
      setInventory(inventoryMap);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (serviceId, field, value) => {
    setInventory((prev) => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || { serviceId }),
        [field]: value,
      },
    }));
  };

  const handleSave = async (service) => {
    try {
      setSavingId(service.id);
      const payload = {
        serviceName: service.name,
        stock: Number(inventory[service.id]?.stock || 0),
        bufferStock: Number(inventory[service.id]?.bufferStock || 0),
      };
      await adminAPI.updateInventory(service.id, payload);
      toast.success('Inventory updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update inventory');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory Management</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Buffer</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-xs text-gray-500">{service.id}</div>
                </td>
                <td className="px-4 py-3">{service.category}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                    value={inventory[service.id]?.stock ?? 0}
                    onChange={(e) => handleChange(service.id, 'stock', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                    value={inventory[service.id]?.bufferStock ?? 0}
                    onChange={(e) => handleChange(service.id, 'bufferStock', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSave(service)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs"
                    disabled={savingId === service.id}
                  >
                    {savingId === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
