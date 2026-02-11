import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Ban, CheckCircle, User, Briefcase, Calendar,
  AlertTriangle, TrendingUp, Loader2, Wifi, WifiOff, Clock, MapPin
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getById(id);
      setEmployee(response.data.data);
    } catch (error) {
      toast.error('Failed to load employee');
      navigate('/admin/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await employeeAPI.toggleStatus(id);
      toast.success('Employee status updated');
      loadEmployee();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading employee...</p>
      </div>
    );
  }

  if (!employee) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'tasks', label: 'Tasks', icon: Briefcase },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/employees')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>
      </div>

      {/* Employee Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-3xl">
              {employee.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-600">{employee.employeeId}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  employee.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  employee.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {employee.status}
                </span>
                <div className="flex items-center gap-1">
                  {employee.onlineStatus === 'ONLINE' ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/admin/employees/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                employee.status === 'ACTIVE'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Ban className="w-4 h-4" />
              {employee.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Employee Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{employee.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Phone</label>
                <p className="text-gray-900">{employee.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Username</label>
                <p className="text-gray-900">{employee.username}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Role</label>
                <p className="text-gray-900">{employee.role}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Shift Timing</label>
                <p className="text-gray-900">
                  {employee.shiftStartTime || '09:00'} - {employee.shiftEndTime || '17:00'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">IoT Device</label>
                <p className="text-gray-900">{employee.assignedIoTDevice || 'Not Assigned'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {employee.skills?.length > 0 ? (
                  employee.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills assigned</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">Member Since</label>
              <p className="text-gray-900">
                {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Tasks Overview</h2>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">
                Assign Task
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Assigned</p>
                <p className="text-3xl font-bold text-blue-600">
                  {employee.performanceMetrics?.totalTasksAssigned || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {employee.performanceMetrics?.tasksCompleted || 0}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-600">
                  {employee.performanceMetrics?.tasksFailed || 0}
                </p>
              </div>
            </div>

            <div className="text-center py-12 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Task history will appear here</p>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Attendance Records</h2>

            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="font-semibold">Today's Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                employee.attendanceStatus === 'PRESENT' ? 'bg-green-100 text-green-700' :
                employee.attendanceStatus === 'LATE' ? 'bg-orange-100 text-orange-700' :
                employee.attendanceStatus === 'ABSENT' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {employee.attendanceStatus || 'ABSENT'}
              </span>
            </div>

            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Attendance calendar will appear here</p>
            </div>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">IoT Incidents</h2>

            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Total Incidents</p>
              <p className="text-3xl font-bold text-orange-600">
                {employee.performanceMetrics?.incidentCount || 0}
              </p>
            </div>

            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Incident reports will appear here</p>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {employee.performanceMetrics?.completionRate?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Reliability Score</p>
                <p className="text-3xl font-bold text-primary-600">
                  {employee.performanceMetrics?.reliabilityScore?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Avg Handling Time</p>
                <p className="text-3xl font-bold text-gray-900">
                  {employee.performanceMetrics?.averageHandlingTime?.toFixed(1) || 0} min
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Incidents</p>
                <p className="text-3xl font-bold text-orange-600">
                  {employee.performanceMetrics?.incidentCount || 0}
                </p>
              </div>
            </div>

            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Performance charts will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

