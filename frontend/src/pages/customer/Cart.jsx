import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Loader2, Wallet } from 'lucide-react';
import useCartStore from '../../stores/cartStore';
import useAuthStore from '../../stores/authStore';
import { customerAPI, servicesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal, loading: cartLoading, initCart, syncCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponList, setShowCouponList] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  const total = useMemo(() => getTotal(), [items, getTotal]);

  // Initialize cart on component mount
  useEffect(() => {
    if (isAuthenticated) {
      initCart();
    }
  }, [isAuthenticated, initCart]);

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await customerAPI.getAvailableCoupons();
        const coupons = response.data.data || [];
        setAvailableCoupons(coupons);
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
        // Silently fail - coupons are optional
        setAvailableCoupons([]);
      }
    };

    if (isAuthenticated) {
      fetchCoupons();
    }
  }, [isAuthenticated]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await customerAPI.getWalletBalance();
        setWalletBalance(response.data.data || 0);
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
        setWalletBalance(0);
      }
    };

    if (isAuthenticated) {
      fetchWalletBalance();
    }
  }, [isAuthenticated]);

  const handleApplyCoupon = async (code = null) => {
    const codeToApply = code || couponCode;

    if (!codeToApply.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await customerAPI.validateCoupon(codeToApply.toUpperCase(), total);
      const discount = response.data.data;

      setCouponDiscount(Number(discount) || 0);
      setAppliedCoupon(codeToApply.toUpperCase());
      setCouponCode(codeToApply.toUpperCase());
      setShowCouponList(false);
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

  // Calculate wallet amount to use (can't exceed total after coupon discount)
  const walletAmountToUse = useWallet ? Math.min(walletBalance, total - couponDiscount) : 0;
  const finalTotal = Math.max(0, total - couponDiscount - walletAmountToUse);

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

    // Validate phone number
    if (!user.mobile) {
      toast.error('Please add your phone number in profile before ordering');
      navigate('/my/profile');
      return;
    }

    // Validate address
    if (!user.address || !user.city || !user.pincode) {
      toast.error('Please complete your delivery address in profile before ordering');
      navigate('/my/profile');
      return;
    }

    setLoading(true);

    try {
      // Create order from cart
      const orderData = {
        deliveryAddress: user.address,
        city: user.city,
        state: user.state || '',
        pincode: user.pincode,
        customerNote: `Order with ${items.length} items`,
        couponCode: appliedCoupon || null,
        useWallet: useWallet && walletAmountToUse > 0,
        walletAmount: walletAmountToUse,
      };

      console.log('Creating order:', orderData);
      const response = await customerAPI.createOrder(orderData);
      console.log('Order created successfully:', response.data);

      toast.success('Order placed successfully!');

      // Clear applied coupon and wallet usage
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponDiscount(0);
      setUseWallet(false);

      // Refresh wallet balance
      try {
        const walletResponse = await customerAPI.getWalletBalance();
        setWalletBalance(walletResponse.data.data || 0);
      } catch (e) {
        console.error('Failed to refresh wallet balance:', e);
      }

      // Sync cart to update frontend state (backend has already cleared it)
      await syncCart();

      // Navigate to orders page
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
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.serviceName} className="w-full h-full object-cover" />
                  ) : (
                    item.descriptionIcon || '📦'
                  )}
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Have a coupon code?
              </label>
              {!appliedCoupon && availableCoupons.length > 0 && (
                <button
                  onClick={() => setShowCouponList(!showCouponList)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showCouponList ? 'Hide' : 'View'} Available Coupons
                </button>
              )}
            </div>

            {/* Available Coupons List */}
            {showCouponList && !appliedCoupon && (
              <div className="mb-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                {availableCoupons.map((coupon) => {
                  const meetsMinimum = total >= (coupon.minOrderValue || 0);
                  return (
                    <div
                      key={coupon.id}
                      className={`p-3 border-b border-gray-100 last:border-b-0 ${
                        meetsMinimum ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50'
                      }`}
                      onClick={() => meetsMinimum && handleApplyCoupon(coupon.code)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-bold text-primary-600">
                              {coupon.code}
                            </span>
                            {coupon.discountType === 'PERCENTAGE' ? (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                                {coupon.discountValue}% OFF
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                                ${coupon.discountValue} OFF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {coupon.description}
                          </p>
                          {coupon.minOrderValue > 0 && (
                            <p className="text-xs text-gray-500">
                              Min. order: ${coupon.minOrderValue.toFixed(2)}
                              {!meetsMinimum && (
                                <span className="text-red-600 ml-1">
                                  (Need ${(coupon.minOrderValue - total).toFixed(2)} more)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        {meetsMinimum && (
                          <button
                            className="text-xs px-3 py-1 bg-primary-600 text-white rounded font-medium hover:bg-primary-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyCoupon(coupon.code);
                            }}
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                  onClick={() => handleApplyCoupon()}
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

          {/* Wallet Section */}
          {isAuthenticated && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Wallet Balance</h3>
              </div>
              {walletBalance > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        Use wallet balance
                      </span>
                    </label>
                    <span className="text-lg font-bold text-purple-600">
                      ${walletBalance.toFixed(2)}
                    </span>
                  </div>
                  {useWallet && (
                    <div className="mt-2 text-sm text-purple-700 bg-purple-100 rounded-lg p-2">
                      💰 Using ${walletAmountToUse.toFixed(2)} from wallet
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-500 text-sm">No wallet balance</p>
                  <p className="text-xs text-gray-400 mt-1">Refunds will be credited here</p>
                </div>
              )}
            </div>
          )}

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

          {walletAmountToUse > 0 && (
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span>Wallet Credit</span>
              <span>-${walletAmountToUse.toFixed(2)}</span>
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

          {/* Delivery Info Section */}
          {isAuthenticated && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Delivery Information</h3>
                <Link to="/my/profile" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Edit
                </Link>
              </div>
              
              {/* Phone */}
              <div className="mb-2">
                <span className="text-xs text-gray-500">Phone: </span>
                {user?.mobile ? (
                  <span className="text-sm text-gray-900">+91 {user.mobile}</span>
                ) : (
                  <span className="text-sm text-red-600">⚠️ Not provided - Required</span>
                )}
              </div>
              
              {/* Address */}
              <div>
                <span className="text-xs text-gray-500">Deliver to: </span>
                {user?.address && user?.city && user?.pincode ? (
                  <span className="text-sm text-gray-900">
                    {user.address}, {user.city}, {user.state || ''} {user.pincode}
                  </span>
                ) : (
                  <span className="text-sm text-red-600">⚠️ Incomplete address - Required</span>
                )}
              </div>

              {/* Warning if info is missing */}
              {(!user?.mobile || !user?.address || !user?.city || !user?.pincode) && (
                <Link
                  to="/my/profile"
                  className="mt-3 block w-full text-center px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200"
                >
                  Complete your profile to order →
                </Link>
              )}
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
