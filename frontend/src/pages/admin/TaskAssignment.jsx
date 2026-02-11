import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, TrendingUp, Briefcase, Clock, AlertCircle,
  CheckCircle, XCircle, Loader2, Star, Award, Activity
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/admin';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export default function TaskAssignment() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [task, setTask] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showManualSelect, setShowManualSelect] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);

  useEffect(() => {
    if (taskId) {
      loadTaskAndRecommendations();
    }
  }, [taskId]);

  const loadTaskAndRecommendations = async () => {
    try {
      setLoading(true);

      // Load task details
      const taskResponse = await axios.get(`${API_BASE}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setTask(taskResponse.data.data);

      // Load recommendations
      const recResponse = await axios.get(`${API_BASE}/tasks/${taskId}/recommendations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setRecommendations(recResponse.data.data);

      // Load all employees for manual selection
      const empResponse = await employeeAPI.getAll();
      setAllEmployees(empResponse.data.data);

    } catch (error) {
      console.error('Failed to load:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (employeeId) => {
    setAssigning(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.put(
        `${API_BASE}/tasks/${taskId}/assign/${employeeId}`,
        null,
        {
          params: { assignedBy: user.name || 'Admin' },
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }
      );

      toast.success('Task assigned successfully!');
      navigate('/admin/tasks');
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Failed to assign task';
      toast.error(errorMsg);
    } finally {
      setAssigning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
        <p className="text-gray-600">The requested task could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/tasks')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Assign Task to Employee</h1>
        <p className="text-gray-600 mt-1">Smart recommendations based on availability, workload, and performance</p>
      </div>

      {/* Task Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Task Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Task Number</label>
            <p className="text-gray-900 font-mono">{task.taskNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Priority</label>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              PRIORITY_OPTIONS.find(p => p.value === task.priority)?.color || 'bg-gray-100 text-gray-700'
            }`}>
              {task.priority}
            </span>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-500 mb-1">Title</label>
            <p className="text-gray-900">{task.title}</p>
          </div>
          {task.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-500 mb-1">Description</label>
              <p className="text-gray-700">{task.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Employees */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Recommended Employees
            </h2>
            <p className="text-gray-600 mt-1">AI-powered recommendations based on multiple factors</p>
          </div>
          <button
            onClick={() => setShowManualSelect(!showManualSelect)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            {showManualSelect ? 'Show Recommendations' : 'Manual Selection'}
          </button>
        </div>

        {!showManualSelect ? (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No employees available for recommendation</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className={`bg-white rounded-xl border-2 p-6 hover:shadow-lg transition ${
                    selectedEmployee === rec.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank Badge */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        #{index + 1}
                      </div>

                      {/* Employee Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{rec.name}</h3>
                          <span className="text-sm text-gray-500 font-mono">{rec.employeeId}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(rec.score)}`}>
                            {rec.score.toFixed(1)}% {getScoreLabel(rec.score)}
                          </span>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-start gap-2">
                            <Activity className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500">Availability</p>
                              <p className="text-sm text-gray-900">{rec.availabilityReason}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500">Workload</p>
                              <p className="text-sm text-gray-900">{rec.workloadReason}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-500">Performance</p>
                              <p className="text-sm text-gray-900">{rec.performanceReason}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAssign(rec.id)}
                      disabled={assigning}
                      className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                        index === 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {assigning ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {index === 0 ? 'Best Match - Assign' : 'Assign'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Manual Selection */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Online</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allEmployees.filter(e => e.status === 'ACTIVE').map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                          {employee.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{employee.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{employee.role}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        employee.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        employee.onlineStatus === 'ONLINE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {employee.onlineStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleAssign(employee.id)}
                        disabled={assigning}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

