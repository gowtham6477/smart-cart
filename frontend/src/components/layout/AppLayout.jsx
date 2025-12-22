import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Package, LogOut, Heart, Settings } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import useCartStore from '../../stores/cartStore';

const CATEGORIES = [
  { name: 'Antiques', value: 'antiques', emoji: '🏺' },
  { name: 'Batteries', value: 'batteries', emoji: '🔋' },
  { name: 'Ceramics', value: 'ceramics', emoji: '🏺' },
  { name: 'Dairy', value: 'dairy', emoji: '🥛' },
  { name: 'Electronics', value: 'electronics', emoji: '📱' },
  { name: 'Flammable Liquids', value: 'flammable', emoji: '🔥' },
  { name: 'Glassware', value: 'glassware', emoji: '🍷' },
  { name: 'High-End Jewelry', value: 'jewelry', emoji: '💍' },
  { name: 'Industrial Equipment', value: 'industrial', emoji: '⚙️' },
  { name: 'Musical Instruments', value: 'musical', emoji: '🎸' },
  { name: 'Pharmaceuticals', value: 'pharmaceuticals', emoji: '💊' },
  { name: 'Sculptures', value: 'sculptures', emoji: '🗿' },
  { name: 'TVs & Monitors', value: 'tvs', emoji: '📺' },
  { name: 'Vintage Heirloom', value: 'vintage', emoji: '👑' },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2">
              <Package className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SmartCart</h1>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Admin Panel' : isEmployee ? 'Employee Panel' : 'Premium Products'}
                </p>
              </div>
            </Link>

            {/* Search Bar - Hide for Admin/Employee */}
            {!isAdmin && !isEmployee && (
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
                <div className="flex w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* Admin/Employee Nav */}
            {(isAdmin || isEmployee) && (
              <nav className="hidden md:flex items-center gap-4 flex-1">
                {isAdmin && (
                  <>
                    <Link to="/admin" className="text-sm font-medium text-gray-700 hover:text-primary-600">Dashboard</Link>
                    <Link to="/admin/products" className="text-sm font-medium text-gray-700 hover:text-primary-600">Products</Link>
                    <Link to="/admin/orders" className="text-sm font-medium text-gray-700 hover:text-primary-600">Orders</Link>
                    <Link to="/admin/coupons" className="text-sm font-medium text-gray-700 hover:text-primary-600">Coupons</Link>
                    <Link to="/admin/employees" className="text-sm font-medium text-gray-700 hover:text-primary-600">Employees</Link>
                  </>
                )}
                {isEmployee && (
                  <>
                    <Link to="/employee" className="text-sm font-medium text-gray-700 hover:text-primary-600">Dashboard</Link>
                    <Link to="/employee/orders" className="text-sm font-medium text-gray-700 hover:text-primary-600">Orders</Link>
                  </>
                )}
              </nav>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Cart - Hide for Admin/Employee */}
              {!isAdmin && !isEmployee && (
                <Link
                  to="/cart"
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Profile or Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {profileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-20">
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/my/orders"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Package className="w-4 h-4" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Heart className="w-4 h-4" />
                          <span>Wishlist</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="btn-primary flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar - Only show for customers */}
        {!isAdmin && !isEmployee && (
          <div className="border-t bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto no-scrollbar">
              <div className="flex gap-4 items-center whitespace-nowrap">
                <Link
                  to="/products"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                >
                  All Products
                </Link>
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.value}
                    to={`/products/category/${category.value}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu - Only for customers */}
        {!isAdmin && !isEmployee && mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="p-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    className="px-6 bg-primary-600 text-white rounded-r-lg"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.value}
                    to={`/products/category/${category.value}`}
                    className="block px-4 py-2 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-2">{category.emoji}</span>
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-180px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">SmartCart</h3>
              <p className="text-gray-400 text-sm">
                Your trusted marketplace for premium products across all categories.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/products" className="hover:text-white">All Products</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/shipping" className="hover:text-white">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-2">Subscribe for exclusive deals</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-primary-500"
                />
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 SmartCart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
