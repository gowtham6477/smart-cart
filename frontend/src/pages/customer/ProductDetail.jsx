import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Loader2, AlertCircle, Star, Heart, Share2, CheckCircle, Truck, ShieldCheck } from 'lucide-react';
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

export default function ProductDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
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

  const handleAddToCart = () => {
    if (!service) return;

    addItem({
      id: service.id,
      name: service.name,
      price: service.basePrice || 0,
      imageUrl: service.imageUrl,
      category: CATEGORY_LABELS[service.category?.toUpperCase()] || service.category,
    }, quantity);

    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error || 'Product not found'}</p>
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[service.category?.toUpperCase()] || service.category;
  const images = service.imageUrl ? [service.imageUrl, service.imageUrl, service.imageUrl] : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/products" className="hover:text-primary-600">Products</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{service.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {images[selectedImage] ? (
                    <img
                      src={images[selectedImage]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x800?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                          selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${service.name} view ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Heart className="w-5 h-5" />
                  Save
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">(234 reviews)</span>
              </div>

              <div className="border-t border-b border-gray-200 py-4 mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${service.basePrice?.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ${(service.basePrice * 1.2).toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                    Save 20%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {service.features && service.features.length > 0 ? (
                    service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>High-quality product</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Category Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                  {categoryLabel}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-700 transition text-lg"
                >
                  <ShoppingCart className="w-6 h-6" />
                  Add to Cart
                </button>
                <button className="w-full bg-orange-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-orange-600 transition text-lg">
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Free Delivery</p>
                    <p className="text-sm text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure transaction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Quality Guaranteed</p>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
          <p className="text-gray-700 leading-relaxed">
            {service.description}
          </p>

          {service.features && service.features.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Features & Specifications</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

