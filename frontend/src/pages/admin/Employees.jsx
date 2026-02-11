import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Search, Filter, Grid, List,
  CheckCircle, XCircle, Clock, AlertTriangle,
  Briefcase, Wifi, WifiOff, Edit, Ban, Eye,
  TrendingUp, Award, BarChart, Loader2, Trash2
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function EmployeeManagement() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterOnline, setFilterOnline] = useState('ALL');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await employeeAPI.toggleStatus(id);
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      toast.success(`Employee ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully`);
      loadEmployees(); // Reload to get updated data
    } catch (error) {
      toast.error('Failed to update employee status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await employeeAPI.delete(id);
      toast.success('Employee deleted successfully');
      loadEmployees(); // Reload list
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Failed to delete employee';
      toast.error(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      INACTIVE: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getAttendanceColor = (status) => {
    const colors = {
      PRESENT: 'text-green-600',
      LATE: 'text-orange-600',
      ABSENT: 'text-red-600',
      LEAVE: 'text-blue-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const getPerformanceScore = (employee) => {
    return employee.performanceMetrics?.reliabilityScore || 0;
  };

  const getTasksCompleted = (employee) => {
    return employee.performanceMetrics?.tasksCompleted || 0;
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || emp.status === filterStatus;
    const matchesOnline = filterOnline === 'ALL' || emp.onlineStatus === filterOnline;
    return matchesSearch && matchesStatus && matchesOnline;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'ACTIVE').length,
    online: employees.filter(e => e.onlineStatus === 'ONLINE').length,
    tasksToday: employees.reduce((sum, e) => sum + (e.tasksToday || 0), 0),
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            Employee Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your workforce efficiently</p>
        </div>
        <Link
          to="/admin/employees/add"
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition shadow-md hover:shadow-lg"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Online Now</p>
              <p className="text-3xl font-bold text-primary-600">{stats.online}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Wifi className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Orders Today</p>
              <p className="text-3xl font-bold text-primary-600">{stats.tasksToday}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Online Filter */}
            <select
              value={filterOnline}
              onChange={(e) => setFilterOnline(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {/* View Toggle */}
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

      {/* Employee List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{employee.name}</h3>
                      <p className="text-xs text-primary-100">{employee.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {employee.onlineStatus === 'ONLINE' ? (
                      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        <Wifi className="w-3 h-3" />
                        Online
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
                        <WifiOff className="w-3 h-3" />
                        Offline
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-semibold text-gray-900">{employee.role}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Attendance:</span>
                  <span className={`font-semibold ${getAttendanceColor(employee.attendanceStatus)}`}>
                    {employee.attendanceStatus}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Orders Today</p>
                      <p className="font-bold text-blue-600">{employee.tasksToday || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Completed</p>
                      <p className="font-bold text-green-600">{getTasksCompleted(employee)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Performance</span>
                    <span className="text-xs font-semibold text-gray-900">{getPerformanceScore(employee).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getPerformanceScore(employee) >= 90 ? 'bg-green-500' :
                        getPerformanceScore(employee) >= 75 ? 'bg-blue-500' :
                        getPerformanceScore(employee) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${getPerformanceScore(employee)}%` }}
                    />
                  </div>
                </div>

                {employee.skills && employee.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {employee.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
                <Link
                  to={`/admin/employees/${employee.id}`}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/employees/${employee.id}/edit`)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(employee.id, employee.status)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                    title={employee.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  >
                    <Ban className={`w-4 h-4 ${employee.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id, employee.name)}
                    className="p-2 hover:bg-red-100 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Online</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Tasks</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Attendance</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Performance</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{employee.role}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {employee.onlineStatus === 'ONLINE' ? (
                      <Wifi className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {getTasksCompleted(employee)}/{employee.tasksToday || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-semibold text-sm ${getAttendanceColor(employee.attendanceStatus)}`}>
                      {employee.attendanceStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getPerformanceScore(employee) >= 90 ? 'bg-green-500' :
                            getPerformanceScore(employee) >= 75 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${getPerformanceScore(employee)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{getPerformanceScore(employee).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/employees/${employee.id}`}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-primary-600" />
                      </Link>
                      <button
                        onClick={() => navigate(`/admin/employees/${employee.id}/edit`)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(employee.id, employee.status)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title={employee.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      >
                        <Ban className={`w-4 h-4 ${employee.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id, employee.name)}
                        className="p-2 hover:bg-red-100 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

