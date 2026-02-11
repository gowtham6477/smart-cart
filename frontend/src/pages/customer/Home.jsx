import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, HeadphonesIcon, Package, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { servicesAPI } from '../../services/api';
import useCartStore from '../../stores/cartStore';

const FEATURED_CATEGORIES = [
  { name: 'Antiques', value: 'ANTIQUES', emoji: '🏺', description: 'Timeless treasures' },
  { name: 'Electronics', value: 'ELECTRONICS', emoji: '📱', description: 'Latest technology' },
  { name: 'Jewelry', value: 'JEWELRY', emoji: '💍', description: 'Precious stones & metals' },
  { name: 'Musical Instruments', value: 'MUSICAL_INSTRUMENTS', emoji: '🎸', description: 'For the artists' },
  { name: 'TVs & Monitors', value: 'TV_MONITOR', emoji: '📺', description: 'Crystal clear displays' },
  { name: 'Vintage Heirloom', value: 'VINTAGE_HEIRLOOM', emoji: '👑', description: 'Rare collectibles' },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Your transactions are protected with industry-standard encryption'
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Quick and reliable delivery to your doorstep'
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Our customer service team is always here to help you'
  },
  {
    icon: Package,
    title: 'Easy Returns',
    description: '30-day return policy for your peace of mind'
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await servicesAPI.getAll();
        const products = res.data.data || [];
        // Get random 8 products
        const shuffled = products.sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 8));
      } catch (error) {
        console.error('Failed to load featured products:', error);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Premium Products for Every Need
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              From antiques to electronics, find quality products across 14+ categories
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products/category/jewelry" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors">
                Explore Jewelry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Explore our wide range of premium products
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {FEATURED_CATEGORIES.map((category) => (
              <Link
                key={category.value}
                to={`/products/category/${category.value}`}
                className="group"
              >
                <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-primary-50 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary-200">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {category.emoji}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              View All Categories
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Handpicked selections just for you
              </p>
            </div>
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <Link to={`/products/${product.id}`} className="block">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        📦
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.basePrice?.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.basePrice || 0,
                        imageUrl: product.imageUrl,
                        category: product.category,
                      });
                    }}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers and find your perfect product today
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
