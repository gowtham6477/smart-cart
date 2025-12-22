import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import useCartStore from '../../stores/cartStore';
import useAuthStore from '../../stores/authStore';
import { customerAPI, servicesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal, loading: cartLoading, initCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const total = useMemo(() => getTotal(), [items, getTotal]);

  // Initialize cart on component mount
  useEffect(() => {
    if (isAuthenticated) {
      initCart();
    }
  }, [isAuthenticated, initCart]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await customerAPI.validateCoupon(couponCode.toUpperCase(), total);
      const discount = response.data.data;

      setCouponDiscount(Number(discount) || 0);
      setAppliedCoupon(couponCode.toUpperCase());
      toast.success(`Coupon applied! You saved $${Number(discount).toFixed(2)}`);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Invalid coupon code';
      toast.error(errorMsg);
      setCouponDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const finalTotal = Math.max(0, total - couponDiscount);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/auth/login');
      return;
    }

    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create bookings for each cart item
      const bookingPromises = items.map(async (item) => {
        try {
          // Get packages for this service
          const packagesRes = await servicesAPI.getPackages(item.serviceId);
          let packages = packagesRes.data.data || [];

          // If no packages exist, get service details
          let selectedPackage;
          if (!packages.length) {
            const serviceRes = await servicesAPI.getById(item.serviceId);
            const service = serviceRes.data.data;

            selectedPackage = {
              id: null,
              name: 'Standard',
              price: service.basePrice || item.price || 0,
              description: 'Standard package'
            };
          } else {
            selectedPackage = packages[0];
          }

          // Create booking with default schedule (tomorrow at 10 AM)
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          const bookingData = {
            serviceId: item.serviceId,
            packageId: selectedPackage.id || null,
            serviceDate: tomorrow.toISOString().split('T')[0],
            serviceTime: '10:00',
            serviceAddress: user.address || '123 Main Street',
            city: user.city || 'Default City',
            pincode: user.pincode || '000000',
            customerNote: `Order from cart - Quantity: ${item.quantity}`,
            couponCode: appliedCoupon || null,
          };

          if (!bookingData.packageId) {
            delete bookingData.packageId;
          }

          console.log('Creating booking:', bookingData);
          const response = await customerAPI.createBooking(bookingData);
          console.log('Booking created successfully:', response.data);

          // Remove from cart after successful booking
          await removeItem(item.serviceId);

          return response;
        } catch (err) {
          console.error(`Failed to create booking for ${item.serviceName}:`, err);
          console.error('Error details:', err.response?.data);
          throw err;
        }
      });

      const results = await Promise.allSettled(bookingPromises);

      // Check if any succeeded
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      if (successful.length === 0) {
        // All failed
        const firstError = failed[0]?.reason?.response?.data?.message || failed[0]?.reason?.message || 'Failed to create orders';
        throw new Error(firstError);
      }

      if (failed.length > 0) {
        // Some succeeded, some failed
        toast.success(`${successful.length} order(s) placed successfully`);
        toast.error(`${failed.length} order(s) failed - still in cart`);
      } else {
        // All succeeded
        toast.success(`Successfully placed ${successful.length} order(s)!`);
      }

      // Navigate to orders page if at least one succeeded
      navigate('/my/orders');
    } catch (error) {
      console.error('Checkout failed:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to place order';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some services to get started.</p>
        <Link to="/products" className="inline-flex items-center px-5 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700">Browse services</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;

            return (
              <div key={item.serviceId} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex gap-4 items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-4xl" aria-hidden>
                  {item.descriptionIcon || '📦'}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.serviceName || 'Unnamed Product'}</h3>
                  <p className="text-sm text-gray-500">{item.category || 'Uncategorized'}</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">${price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.serviceId, quantity - 1)}
                    className="w-9 h-9 inline-flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                    disabled={loading || cartLoading}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.serviceId, quantity + 1)}
                    className="w-9 h-9 inline-flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                    disabled={loading || cartLoading}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.serviceId)}
                  className="text-red-500 hover:text-red-600"
                  disabled={loading || cartLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 h-fit">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

          {/* Coupon Section */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have a coupon code?
            </label>
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={validatingCoupon}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-semibold text-green-700">
                  🎉 {appliedCoupon} applied
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-gray-700 mb-2">
            <span>Subtotal</span>
            <span>${(Number(total) || 0).toFixed(2)}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex items-center justify-between text-green-600 mb-2">
              <span>Coupon Discount</span>
              <span>-${couponDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-gray-700 mb-2">
            <span>Delivery</span>
            <span>$0.00</span>
          </div>
          <div className="border-t border-gray-200 my-4" />
          <div className="flex items-center justify-between text-lg font-bold text-gray-900 mb-6">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>

          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">Please login to place an order</p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full inline-flex items-center justify-center bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Placing Order...
              </>
            ) : (
              'Place Order'
            )}
          </button>
          <button
            onClick={clearCart}
            disabled={loading}
            className="w-full mt-3 inline-flex items-center justify-center border border-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
