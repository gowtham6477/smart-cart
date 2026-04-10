import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Clock, CheckCircle, AlertCircle, TrendingUp,
  Calendar, MapPin, Upload, Image as ImageIcon, PlayCircle,
  StopCircle, Award, Activity, User, RefreshCw, RotateCcw
} from 'lucide-react';
import { workerAPI, iotAPI } from '../../services/api';
import toast from 'react-hot-toast';
import NotificationBell from '../../components/NotificationBell';

const TASK_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock },
  ASSIGNED: { label: 'Assigned', color: 'bg-blue-100 text-blue-700', icon: ClipboardList },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: Activity },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-600' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-600' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-600' },
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const notifiedEventsRef = useRef(new Set());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageType, setImageType] = useState('BEFORE');
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const handleReturnedToHub = async (task) => {
    if (!task?.orderId) {
      toast.error('Order information missing for this task');
      return;
    }

    const reason = window.prompt('Enter reason for returning to hub (fall incident):');
    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      toast.error('Return reason is required');
      return;
    }

    try {
      await iotAPI.markReturnedToHub(task.orderId, reason.trim());
      toast.success('Marked as returned to hub');
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark returned to hub');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats with error handling
      try {
        const statsRes = await workerAPI.getDashboardStats();
        setStats(statsRes.data.data);
      } catch (error) {
        console.error('Failed to load stats:', error.response?.data || error.message);
        // Set default stats if API fails
        setStats({
          pendingTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
          totalTasks: 0,
          todayAttendance: null,
          performanceMetrics: {
            tasksCompleted: 0,
            completionRate: 0,
            averageHandlingTime: 0
          },
          onlineStatus: 'OFFLINE'
        });
      }

      // Load tasks
      try {
        const tasksRes = await workerAPI.getTasks();
        const rawTasks = tasksRes.data.data || [];
        const filtered = rawTasks.filter(task => {
          const notes = typeof task.notes === 'string' ? task.notes.toLowerCase() : '';
          const reason = typeof task.lockReason === 'string' ? task.lockReason.toLowerCase() : '';
          const isReplacement = reason.includes('replacement') || notes.includes('replacement');
          return !isReplacement;
        });
        const uniqueTasks = Array.from(new Map(filtered.map(task => [task.orderId || task.id, task])).values());
        setTasks(uniqueTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks([]);
      }

      // Load critical IoT alerts for active tasks (handled via bell toasts)
      try {
        const eventsRes = await iotAPI.getUnacknowledgedEvents();
        const events = eventsRes.data || [];
        const activeOrderIds = new Set(filtered.map(task => task.orderId).filter(Boolean));
        const critical = events.filter(event => event.eventType === 'FALL' && activeOrderIds.has(event.orderId));
        setCriticalAlerts(critical);
      } catch (error) {
        console.error('Failed to load IoT events:', error);
      }

      // Load today's attendance
      try {
        const attendanceRes = await workerAPI.getTodayAttendance();
        setAttendance(attendanceRes.data.data);
      } catch (error) {
        console.error('Failed to load attendance:', error);
        setAttendance(null);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Some dashboard data could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await workerAPI.checkIn();
      toast.success('Checked in successfully!');
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await workerAPI.checkOut();
      toast.success('Checked out successfully!');
      // Reload dashboard to update attendance state and show Check In button
      await loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      // Check if employee is checked in
      if (!attendance?.isCurrentlyCheckedIn) {
        toast.error('Please check in first before starting any task');
        return;
      }

      await workerAPI.acceptTask(taskId);
      toast.success('Task accepted and started!');
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await workerAPI.updateTaskStatus(taskId, status);
      toast.success('Task status updated!');
      loadDashboardData();
      setSelectedTask(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleImageUpload = async (taskId, file, type) => {
    try {
      setUploading(true);

      // Validate file
      if (!file) {
        toast.error('Please select an image');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await workerAPI.uploadTaskImage(taskId, formData);
      toast.success(`${type} image uploaded successfully!`);

      // Update local task state with uploaded image info
      setTasks(prevTasks => prevTasks.map(t => {
        if (t.id === taskId) {
          const imageUrl = response.data.data;
          if (type === 'BEFORE') {
            return { ...t, beforeImages: [...(t.beforeImages || []), imageUrl] };
          } else if (type === 'AFTER') {
            return { ...t, afterImages: [...(t.afterImages || []), imageUrl] };
          }
        }
        return t;
      }));

      // Reload full data
      await loadDashboardData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleReportDamaged = async (taskId) => {
    if (!window.confirm('Are you sure the product is damaged? This will process a refund for the customer.')) {
      return;
    }

    try {
      await workerAPI.reportDamaged(taskId);
      toast.success('Product reported as damaged. Admin has been notified.');
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report damaged product');
    }
  };

  const handleRequestReplacement = async (taskId) => {
    if (!window.confirm('Request a replacement for this order? The delivery will be marked as delayed.')) {
      return;
    }

    try {
      await workerAPI.requestReplacement(taskId);
      toast.success('Replacement requested. Admin has been notified.');
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request replacement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getTaskUpdatedAt = (task) => {
    const candidates = [task.updatedAt, task.completedAt, task.startedAt, task.assignedAt, task.createdAt];
    const value = candidates.find((date) => !!date);
    return value ? new Date(value).getTime() : 0;
  };

  const activeTasks = tasks.filter(t => ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status));
  const sortedActiveTasks = [...activeTasks].sort((a, b) => getTaskUpdatedAt(b) - getTaskUpdatedAt(a));
  const inProgressTask = sortedActiveTasks.find(task => task.status === 'IN_PROGRESS');
  const isInProgressFallDetected = inProgressTask
    ? inProgressTask?.isLocked || inProgressTask?.lockReason?.toLowerCase()?.includes('fall')
    : false;
  const activeTaskList = inProgressTask
    ? [inProgressTask, ...sortedActiveTasks.filter(task => task.id !== inProgressTask.id)]
    : sortedActiveTasks;
  const latestActiveTasks = activeTaskList.slice(0, 2);
  const completedToday = tasks.filter(t =>
    t.status === 'COMPLETED' &&
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
              <p className="text-blue-100">Welcome back! Here's your work overview</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell userType="employee" />
              <User className="w-16 h-16 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4">
        {/* Attendance Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
                <p className="text-sm text-gray-500">
                  {attendance?.checkInTime
                    ? `Checked in at ${new Date(attendance.checkInTime).toLocaleTimeString()}`
                    : 'Not checked in yet'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!attendance?.isCurrentlyCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  Check In
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2"
                >
                  <StopCircle className="w-5 h-5" />
                  Check Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={ClipboardList}
            label="Pending Tasks"
            value={stats?.pendingTasks || 0}
            color="blue"
          />
          <StatCard
            icon={Activity}
            label="In Progress"
            value={stats?.inProgressTasks || 0}
            color="yellow"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed Today"
            value={completedToday.length}
            color="green"
          />
          <StatCard
            icon={Award}
            label="Total Completed"
            value={stats?.completedTasks || 0}
            color="purple"
          />
        </div>

        {/* Critical IoT Alerts */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-700">Critical IoT Alerts</h2>
                <p className="text-sm text-red-600">Fall detected for active deliveries. Check IoT tab immediately.</p>
              </div>
            </div>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="bg-white rounded-lg p-3 border border-red-200">
                  <p className="text-sm font-semibold text-gray-900">Order {alert.orderId}</p>
                  <p className="text-xs text-gray-600">Device: {alert.deviceId}</p>
                </div>
              ))}
              {criticalAlerts.length > 3 && (
                <p className="text-xs text-red-600">+{criticalAlerts.length - 3} more alerts</p>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {stats?.performanceMetrics && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Your Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Completion Rate"
                value={`${stats.performanceMetrics.completionRate?.toFixed(1) || 0}%`}
              />
              <MetricCard
                label="Tasks Completed"
                value={stats.performanceMetrics.tasksCompleted || 0}
              />
              <MetricCard
                label="Avg. Handling Time"
                value={`${Math.round(stats.performanceMetrics.averageHandlingTime || 0)} min`}
              />
            </div>
          </div>
        )}

        {/* Active Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Tasks</h2>

          {latestActiveTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No active tasks</p>
              <p className="text-gray-400 text-sm">New tasks will appear here when assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {latestActiveTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onAccept={handleAcceptTask}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onUploadImage={handleImageUpload}
                  onViewDetails={() => setSelectedTask(task)}
                  onRequestReplacement={handleRequestReplacement}
                  onReturnedToHub={handleReturnedToHub}
                  uploading={uploading}
                  isLockedExternally={!!inProgressTask && !isInProgressFallDetected && inProgressTask.id !== task.id && !task.isLocked}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedToday.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Completed Today
            </h2>
            <div className="space-y-3">
              {completedToday.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.taskNumber}</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateTaskStatus}
          onUploadImage={handleImageUpload}
          uploading={uploading}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TaskCard({
  task,
  onAccept,
  onUpdateStatus,
  onUploadImage,
  onRequestReplacement,
  onReturnedToHub,
  uploading,
  isLockedExternally,
}) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const StatusIcon = TASK_STATUS_CONFIG[task.status]?.icon || Clock;
  const isReplacement = task.title?.toLowerCase().includes('replacement');
  const isFallDetected = task?.isLocked || task?.lockReason?.toLowerCase()?.includes('fall');
  const isLocked = isLockedExternally && !isFallDetected;

  // Check if both before and after images are uploaded
  const hasBeforeImage = task.beforeImages && task.beforeImages.length > 0;
  const hasAfterImage = task.afterImages && task.afterImages.length > 0;
  const canComplete = hasBeforeImage && hasAfterImage;

  return (
    <div className={`border rounded-lg p-6 transition ${isLocked ? 'border-yellow-200 bg-yellow-50/40' : 'border-gray-200 hover:shadow-md'}`}>
      {isLocked && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          Another task is in progress. Finish that task before starting this one.
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_CONFIG[task.priority]?.color}`}>
              {task.priority}
            </span>
            {isReplacement && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                Replacement
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{task.taskNumber}</p>
          {task.description && (
            <p className="text-gray-700 mb-3">{task.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${TASK_STATUS_CONFIG[task.status]?.color}`}>
          <StatusIcon className="w-4 h-4" />
          {isFallDetected ? 'Damaged (IoT)' : TASK_STATUS_CONFIG[task.status]?.label}
        </span>
      </div>

      {(task.customerName || task.customerMobile || task.address) && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.customerName && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Customer</p>
                <p className="font-semibold text-gray-900">{task.customerName}</p>
              </div>
            )}
            {task.serviceName && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Service</p>
                <p className="font-semibold text-gray-900">{task.serviceName}</p>
              </div>
            )}
          </div>

          {/* Phone - Clickable to Call */}
          {task.customerMobile && (
            <a
              href={`tel:+91${task.customerMobile}`}
              className="flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition border border-green-200"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📞</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-600">Phone Number</p>
                <p className="font-bold text-lg">+91 {task.customerMobile}</p>
              </div>
              <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium">
                Call
              </span>
            </a>
          )}

          {/* Address - Clickable to Open Maps */}
          {task.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${task.address} ${task.city || ''} ${task.state || ''} ${task.pincode || ''} India`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition border border-blue-200"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-600">Delivery Address</p>
                <p className="font-medium">{task.address}</p>
                {(task.city || task.state || task.pincode) && (
                  <p className="text-sm text-blue-600">
                    {task.city && `${task.city}, `}
                    {task.state && `${task.state} `}
                    {task.pincode || ''}
                  </p>
                )}
              </div>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium flex-shrink-0">
                Maps
              </span>
            </a>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        {(task.status === 'ASSIGNED' || task.status === 'PENDING') && (
          <button
            onClick={() => onAccept(task.id)}
            disabled={isLocked}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              isLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            {task.status === 'PENDING' ? 'Start Task' : 'Accept & Start'}
          </button>
        )}

        {task.status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={() => setShowImageUpload(!showImageUpload)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {showImageUpload ? 'Hide' : 'Upload'} Images
            </button>
            <button
              onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
              className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition bg-green-600 text-white hover:bg-green-700"
              title="Mark task as complete"
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </button>
            <button
              onClick={() => onReturnedToHub(task)}
              disabled={!isFallDetected}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                isFallDetected ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isFallDetected ? 'Return to hub after fall incident' : 'Only available when fall is detected'}
            >
              <RotateCcw className="w-4 h-4" />
              Returned to Hub
            </button>
            <button
              onClick={() => onRequestReplacement(task.id)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 flex items-center gap-2"
              title="Request replacement - Delivery will be delayed"
            >
              <RefreshCw className="w-4 h-4" />
              Replacement
            </button>
          </>
        )}
      </div>

      {/* Upload Status Indicator */}
      {task.status === 'IN_PROGRESS' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Uploading images is optional for this task.
          </p>
        </div>
      )}

      {/* Image Upload Section */}
      {showImageUpload && task.status === 'IN_PROGRESS' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Upload Proof Images
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Upload BEFORE/AFTER images if needed (optional)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUploadButton
              label="Before"
              type="BEFORE"
              taskId={task.id}
              onUpload={onUploadImage}
              uploading={uploading}
              images={task.beforeImages}
            />
            <ImageUploadButton
              label="After"
              type="AFTER"
              taskId={task.id}
              onUpload={onUploadImage}
              uploading={uploading}
              images={task.afterImages}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ImageUploadButton({ label, type, taskId, onUpload, uploading, images = [] }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      await onUpload(taskId, file, type);
    }
  };

  const hasImages = images && images.length > 0;
  const displayImage = hasImages ? images[images.length - 1] : preview;

  return (
    <div>
      <label className="block">
        <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
          hasImages
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>

          {displayImage ? (
            <div className="relative">
              <img
                src={displayImage}
                alt={`${label} preview`}
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                ✓ Uploaded
              </div>
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">{label} Image</p>
              <p className="text-xs text-gray-500 mt-1">📷 Tap to capture or upload</p>
            </>
          )}

          {uploading && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-xs text-gray-600 mt-1">Uploading...</p>
            </div>
          )}

          {hasImages && (
            <p className="text-xs text-green-600 mt-2 font-semibold">
              ✓ {images.length} image{images.length > 1 ? 's' : ''} uploaded
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Re-upload button if image already uploaded */}
      {hasImages && !uploading && (
        <button
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          Upload Another
        </button>
      )}
    </div>
  );
}

function TaskDetailModal({ task, onClose, onUpdateStatus, onUploadImage, uploading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
              <p className="text-gray-600">{task.taskNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-500">Description</label>
              <p className="text-gray-900 mt-1">{task.description || 'No description'}</p>
            </div>

            {/* Customer Contact Info */}
            {(task.customerName || task.customerMobile || task.address) && (
              <div className="space-y-3">
                {task.customerName && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Customer</label>
                    <p className="text-gray-900 mt-1 font-medium">{task.customerName}</p>
                  </div>
                )}
                
                {task.serviceName && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Service</label>
                    <p className="text-gray-900 mt-1">{task.serviceName}</p>
                  </div>
                )}

                {/* Phone - Clickable to Call */}
                {task.customerMobile && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Phone</label>
                    <a
                      href={`tel:+91${task.customerMobile}`}
                      className="mt-2 flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition border border-green-200"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">📞</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg">+91 {task.customerMobile}</p>
                      </div>
                      <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                        Call Now
                      </span>
                    </a>
                  </div>
                )}

                {/* Address - Clickable to Open Maps */}
                {task.address && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Delivery Address</label>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${task.address} ${task.city || ''} ${task.state || ''} ${task.pincode || ''} India`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-start gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition border border-blue-200"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{task.address}</p>
                        {(task.city || task.state || task.pincode) && (
                          <p className="text-sm text-blue-600">
                            {task.city && `${task.city}, `}
                            {task.state && `${task.state} `}
                            {task.pincode || ''}
                          </p>
                        )}
                      </div>
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex-shrink-0">
                        Open Maps
                      </span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {task.beforeImages && task.beforeImages.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-500">Before Images</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {task.beforeImages.map((url, idx) => (
                    <img key={idx} src={url} alt="Before" className="w-full h-32 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {task.afterImages && task.afterImages.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-500">After Images</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {task.afterImages.map((url, idx) => (
                    <img key={idx} src={url} alt="After" className="w-full h-32 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

