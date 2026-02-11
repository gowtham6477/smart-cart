import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Clock, ShoppingBag, RefreshCw } from 'lucide-react';
import { customerAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getWallet();
      setWallet(response.data.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-40 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const transactions = wallet?.transactions || [];
  const balance = wallet?.balance || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <button
          onClick={fetchWallet}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <WalletIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-purple-200 text-sm">Available Balance</p>
            <h2 className="text-4xl font-bold">${balance.toFixed(2)}</h2>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-purple-200 text-sm">
            💡 Use your wallet balance at checkout to get instant discounts!
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          to="/cart"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="p-2 bg-purple-100 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Use Balance</p>
            <p className="text-sm text-gray-500">Apply at checkout</p>
          </div>
        </Link>
        <Link
          to="/my/orders"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="p-2 bg-green-100 rounded-lg">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">My Orders</p>
            <p className="text-sm text-gray-500">Track refunds</p>
          </div>
        </Link>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your refunds and wallet usage will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((txn, index) => (
              <div
                key={txn.id || index}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      txn.type === 'CREDIT'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {txn.type === 'CREDIT' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {txn.description || (txn.type === 'CREDIT' ? 'Credit' : 'Debit')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(txn.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {txn.type === 'CREDIT' ? '+' : '-'}${txn.amount?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Balance: ${txn.balanceAfter?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Refunds from damaged or cancelled orders are credited to your wallet</li>
          <li>• Use your wallet balance during checkout to reduce payment amount</li>
          <li>• Wallet balance never expires</li>
        </ul>
      </div>
    </div>
  );
}
