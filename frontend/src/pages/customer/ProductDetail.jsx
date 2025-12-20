import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
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

export default function ProductDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await servicesAPI.getById(id);
        setService(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error || 'Product not found'}</p>
      </div>
    );
  }

  const icon = CATEGORY_ICONS[service.category?.toUpperCase()] || '📦';
  const categoryLabel = CATEGORY_LABELS[service.category?.toUpperCase()] || service.category;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-square bg-gray-50 flex items-center justify-center text-8xl" aria-hidden>
            {icon}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
          <p className="text-sm font-medium text-primary-700 bg-primary-50 inline-flex px-2 py-1 rounded-full mb-4">{categoryLabel}</p>
          <p className="text-lg text-gray-700 mb-6">{service.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Base price</p>
              <p className="text-3xl font-bold text-gray-900">${service.basePrice?.toFixed(2) || '—'}</p>
            </div>
            {service.estimatedDuration && service.estimatedDuration > 0 && (
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{service.estimatedDuration} mins</p>
              </div>
            )}
          </div>

          {Array.isArray(service.features) && service.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {service.features.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => addItem({
              id: service.id,
              name: service.name,
              price: service.basePrice || 0,
              imageUrl: null,
              category: categoryLabel,
              descriptionIcon: icon,
            })}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-lg text-base font-semibold hover:bg-primary-700 transition"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
