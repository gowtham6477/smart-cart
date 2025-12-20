import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, Loader2, AlertCircle, Filter } from 'lucide-react';
import { servicesAPI } from '../../services/api';
import useCartStore from '../../stores/cartStore';

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

export default function ProductList() {
  const { category } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const addItem = useCartStore((s) => s.addItem);

  const filtered = useMemo(() => {
    if (!category) return services;
    const code = category.toUpperCase();
    return services.filter((s) => s.category?.toUpperCase() === code);
  }, [services, category]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await servicesAPI.getAll();
        setServices(res.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">No products in this category yet.</p>
      </div>
    );
  }

  const currentLabel = category ? CATEGORY_LABELS[category.toUpperCase()] || category : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentLabel}</h1>
          <p className="text-gray-600">Browse {category ? currentLabel : 'all categories'}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>{category ? `Showing ${filtered.length} items` : `Showing ${services.length} items`}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((service) => {
          const icon = CATEGORY_ICONS[service.category?.toUpperCase()] || '📦';
          return (
            <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="aspect-video bg-gray-50 flex items-center justify-center text-6xl" aria-hidden>
                {icon}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700">{CATEGORY_LABELS[service.category?.toUpperCase()] || service.category}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{service.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-xl font-bold text-gray-900">${service.basePrice?.toFixed(2) || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/products/${service.id}`} className="text-primary-600 text-sm font-semibold hover:text-primary-700">
                      View
                    </Link>
                    <button
                      onClick={() => addItem({
                        id: service.id,
                        name: service.name,
                        price: service.basePrice || 0,
                        imageUrl: null,
                        category: CATEGORY_LABELS[service.category?.toUpperCase()] || service.category,
                        descriptionIcon: icon,
                      })}
                      className="inline-flex items-center gap-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
