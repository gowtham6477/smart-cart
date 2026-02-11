import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, Loader2, AlertCircle, Filter, Grid, List, Star, Heart, ChevronDown } from 'lucide-react';
import { servicesAPI } from '../../services/api';
import useCartStore from '../../stores/cartStore';
import toast from 'react-hot-toast';

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const filtered = useMemo(() => {
    let result = category
      ? services.filter((s) => s.category?.toUpperCase() === category.toUpperCase())
      : services;

    // Apply price filter
    result = result.filter(s => s.basePrice >= priceRange[0] && s.basePrice <= priceRange[1]);

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured - keep original order
        break;
    }

    return result;
  }, [services, category, sortBy, priceRange]);

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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLabel}</h1>
          <p className="text-gray-600">{filtered.length} results</p>
        </div>

        {/* Filters & Sort Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex gap-4">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <Link to={`/products/${service.id}`} className="block relative">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </Link>

                <div className="p-4">
                  <Link to={`/products/${service.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary-600">
                      {service.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(4.5)</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${service.basePrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: service.id,
                        name: service.name,
                        price: service.basePrice || 0,
                        imageUrl: service.imageUrl,
                        category: CATEGORY_LABELS[service.category?.toUpperCase()] || service.category,
                      });
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-shadow flex gap-4"
              >
                <Link to={`/products/${service.id}`} className="flex-shrink-0">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1">
                  <Link to={`/products/${service.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600">
                      {service.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(4.5)</span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>

                  {service.features && service.features.length > 0 && (
                    <ul className="mb-4 space-y-1">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-3xl font-bold text-gray-900">
                      ${service.basePrice?.toFixed(2)}
                    </span>

                    <button
                      onClick={() => {
                        addItem({
                          id: service.id,
                          name: service.name,
                          price: service.basePrice || 0,
                          imageUrl: service.imageUrl,
                          category: CATEGORY_LABELS[service.category?.toUpperCase()] || service.category,
                        });
                      }}
                      className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

