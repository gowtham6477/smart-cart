import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, PackageSearch, PlusCircle, Trash2, Edit } from 'lucide-react';
import { adminAPI, servicesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  ANTIQUES: '🏺',
  BATTERIES: '🔋',
  CERAMICS: '🏺',
  DAIRY: '🥛',
  ELECTRONICS: '📱',
  FLAMMABLE_LIQUIDS: '🔥',
  GLASSWARE: '🍷',
  JEWELRY: '💍',
  INDUSTRIAL_EQUIPMENT: '⚙️',
  MUSICAL_INSTRUMENTS: '🎸',
  PHARMACEUTICALS: '💊',
  SCULPTURES: '🗿',
  TV_MONITOR: '📺',
  VINTAGE_HEIRLOOM: '👑',
};

const CATEGORY_LABELS = {
  ANTIQUES: 'Antiques',
  BATTERIES: 'Batteries',
  CERAMICS: 'Ceramics',
  DAIRY: 'Dairy',
  ELECTRONICS: 'Electronics',
  FLAMMABLE_LIQUIDS: 'Flammable Liquids',
  GLASSWARE: 'Glassware',
  JEWELRY: 'High-End Jewelry',
  INDUSTRIAL_EQUIPMENT: 'Industrial Equipment',
  MUSICAL_INSTRUMENTS: 'Musical Instruments',
  PHARMACEUTICALS: 'Pharmaceuticals',
  SCULPTURES: 'Sculptures',
  TV_MONITOR: 'TVs & Monitors',
  VINTAGE_HEIRLOOM: 'Vintage Heirloom',
};

export default function AdminProducts() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await servicesAPI.getAll();
      setServices(res.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load services');
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await adminAPI.deleteService(id);
      toast.success('Service deleted successfully');
      loadServices();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete service');
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.category?.toUpperCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...Object.keys(CATEGORY_LABELS)];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading services...</p>
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage all services and products</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700">
          <PlusCircle className="w-5 h-5" />
          Add Service (coming soon)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center">
          <PackageSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No services found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Icon</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => {
                  const icon = CATEGORY_ICONS[service.category?.toUpperCase()] || '📦';
                  const categoryLabel = CATEGORY_LABELS[service.category?.toUpperCase()] || service.category;

                  return (
                    <tr key={service.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="text-3xl">{icon}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{service.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700">
                          {categoryLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">${service.basePrice?.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/products/${service.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => toast.info('Edit feature coming soon')}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing {filteredServices.length} of {services.length} services
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
