import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Loader2 } from 'lucide-react';
import { servicesAPI, adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [servicesRes, ordersRes] = await Promise.all([
          servicesAPI.getAll(),
          adminAPI.getAllBookings().catch(() => ({ data: { data: [] } })),
        ]);

        const services = servicesRes.data.data || [];
        const orders = ordersRes.data.data || [];

        const revenue = orders.reduce((sum, o) => sum + (o.finalPrice || 0), 0);
        const customers = new Set(orders.map(o => o.customerId)).size;

        setStats({
          totalProducts: services.length,
          totalOrders: orders.length,
          totalRevenue: revenue,
          totalCustomers: customers,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">${stats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <Package className="w-5 h-5 text-primary-600" />
              <div>
                <div className="font-semibold text-gray-900">Manage Products</div>
                <div className="text-sm text-gray-600">View and edit all services</div>
              </div>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">View Orders</div>
                <div className="text-sm text-gray-600">Monitor all bookings</div>
              </div>
            </Link>
            <Link
              to="/admin/coupons"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">Manage Coupons</div>
                <div className="text-sm text-gray-600">Create promotional offers</div>
              </div>
            </Link>
            <Link
              to="/admin/employees"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">Manage Employees</div>
                <div className="text-sm text-gray-600">View staff members</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Active Products</div>
                <div className="text-sm text-gray-600">Currently available</div>
              </div>
              <div className="text-2xl font-bold text-primary-600">{stats.totalProducts}</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Pending Orders</div>
                <div className="text-sm text-gray-600">Awaiting processing</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">—</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Completed Orders</div>
                <div className="text-sm text-gray-600">Successfully fulfilled</div>
              </div>
              <div className="text-2xl font-bold text-green-600">—</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
