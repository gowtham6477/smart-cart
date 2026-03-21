import { useEffect, useState, useRef } from 'react';
import { 
  AlertTriangle, 
  AlertCircle,
  Activity, 
  CheckCircle, 
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Clock,
  Package,
  Trash2,
  Link,
  Unlink,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { iotAPI, authAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDeviceStatusColor = (status) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-green-100 text-green-800';
    case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
    case 'IN_USE': return 'bg-purple-100 text-purple-800';
    case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
    case 'OFFLINE': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getEventIcon = (eventType) => {
  switch (eventType) {
    case 'FALL': return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'IMPACT': return <AlertCircle className="w-5 h-5 text-orange-500" />;
    case 'DEVICE_OFFLINE': return <WifiOff className="w-5 h-5 text-gray-500" />;
    case 'ABNORMAL_MOVEMENT': return <Activity className="w-5 h-5 text-yellow-500" />;
    default: return <Activity className="w-5 h-5 text-blue-500" />;
  }
};

const getEventDescription = (eventType) => {
  switch (eventType) {
    case 'FALL': return 'Product fell - Employee returning to hub';
    case 'IMPACT': return 'Impact detected - Handle with care';
    case 'DEVICE_OFFLINE': return 'Device offline - Check connection';
    case 'ABNORMAL_MOVEMENT': return 'Unusual movement pattern detected';
    default: return eventType;
  }
};

export default function IoTEvents() {
  const [events, setEvents] = useState([]);
  const [devices, setDevices] = useState([]);
  const [deviceStats, setDeviceStats] = useState(null);
  const [stats, setStats] = useState(null);
  const [secondAttemptOrders, setSecondAttemptOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [lastEventCount, setLastEventCount] = useState(0);
  const [activeTab, setActiveTab] = useState('devices');
  const audioRef = useRef(null);

  const fetchEvents = async () => {
    try {
      let response;
      if (filter === 'unacknowledged') {
        response = await iotAPI.getUnacknowledgedEvents();
      } else if (filter === 'critical') {
        response = await iotAPI.getCriticalEvents();
      } else {
        response = await iotAPI.getEvents();
      }
      let newEvents = response.data || [];
      if (filter === 'fall') {
        newEvents = newEvents.filter(e => e.eventType === 'FALL');
      }
      if (newEvents.length > lastEventCount) {
        const latestEvent = newEvents[0];
        if (latestEvent && latestEvent.eventType === 'FALL' && !latestEvent.acknowledged) {
          showAlertNotification(latestEvent);
        }
      }
      setLastEventCount(newEvents.length);
      setEvents(newEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await iotAPI.getAllDevices();
      const deviceList = response.data?.data || response.data || [];
      setDevices(Array.isArray(deviceList) ? deviceList : []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchDeviceStats = async () => {
    try {
      const response = await iotAPI.getDeviceStats();
      setDeviceStats(response.data?.data || response.data || null);
    } catch (error) {
      console.error('Error fetching device stats:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await iotAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSecondAttemptOrders = async () => {
    try {
      const response = await iotAPI.getSecondAttemptOrders();
      setSecondAttemptOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching second attempt orders:', error);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const response = await adminAPI.getAllOrders();
      const allOrders = response.data?.data || response.data || [];
      const orders = Array.isArray(allOrders) 
        ? allOrders.filter(order => 
            !order.iotDeviceId && 
            ['ASSIGNED', 'OUT_FOR_DELIVERY', 'SHIPPED', 'PROCESSING'].includes(order.status)
          )
        : [];
      setAvailableOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const showAlertNotification = (event) => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-red-600 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
            <div className="ml-3 flex-1">
              <p className="text-lg font-bold">🚨 {event.eventType} DETECTED!</p>
              <p className="mt-1 text-sm text-red-100">Device: {event.deviceId}</p>
              {event.orderId && <p className="text-sm text-red-100">Order: {event.orderId}</p>}
              <p className="text-sm text-red-100">{getEventDescription(event.eventType)}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-red-500">
          <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-100 hover:text-white focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDevices(), fetchDeviceStats(), fetchEvents(), fetchStats(), fetchSecondAttemptOrders(), fetchAvailableOrders()]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filter]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => { fetchDevices(); fetchDeviceStats(); fetchEvents(); fetchStats(); fetchSecondAttemptOrders(); }, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, filter, lastEventCount]);

  const handleAcknowledge = async (eventId) => {
    try {
      const user = authAPI.getCurrentUser();
      await iotAPI.acknowledgeEvent(eventId, user?.id || 'admin');
      toast.success('Event acknowledged');
      fetchEvents();
      fetchStats();
    } catch (error) {
      toast.error('Failed to acknowledge event');
    }
  };

  const handleAssignDevice = async () => {
    if (!selectedDevice || !selectedOrderId) {
      toast.error('Please select a device and an order');
      return;
    }
    try {
      await iotAPI.assignDeviceToOrder(selectedDevice.deviceId, selectedOrderId);
      toast.success(`Device ${selectedDevice.deviceId} assigned successfully!`);
      setShowAssignModal(false);
      setSelectedDevice(null);
      setSelectedOrderId('');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign device');
    }
  };

  const handleReleaseDevice = async (orderId) => {
    try {
      await iotAPI.releaseDevice(orderId);
      toast.success('Device released successfully');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release device');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm(`Are you sure you want to delete device ${deviceId}?`)) return;
    try {
      await iotAPI.deleteDevice(deviceId);
      toast.success('Device deleted');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete device');
    }
  };

  const handleFullReset = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL IoT events, reset ALL devices, and clear IoT data from ALL orders. This action cannot be undone. Continue?')) return;
    try {
      const response = await iotAPI.fullReset();
      const result = response.data?.data || response.data;
      toast.success(`Reset complete! Events: ${result.eventsCleared}, Devices: ${result.devicesReset}, Orders: ${result.ordersCleared}`);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to perform full reset');
    }
  };

  const openAssignModal = (device) => {
    setSelectedDevice(device);
    setSelectedOrderId('');
    fetchAvailableOrders();
    setShowAssignModal(true);
  };

  const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString() : 'N/A';
  const formatDuration = (m) => !m ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAsffLvf/9BtABVtr/P/sT8A" />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IoT Device Management</h1>
          <p className="text-gray-600">Manage ESP32 devices and monitor real-time events</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${autoRefresh ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            {autoRefresh ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}{autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button onClick={handleFullReset} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Trash2 className="w-4 h-4" />Reset All Data
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500"><div className="flex justify-between items-center"><div><p className="text-gray-500 text-sm">Total Devices</p><p className="text-2xl font-bold">{deviceStats?.total || devices.length}</p></div><Smartphone className="w-10 h-10 text-blue-500" /></div></div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500"><div className="flex justify-between items-center"><div><p className="text-gray-500 text-sm">Available</p><p className="text-2xl font-bold">{deviceStats?.available || 0}</p></div><CheckCircle className="w-10 h-10 text-green-500" /></div></div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500"><div className="flex justify-between items-center"><div><p className="text-gray-500 text-sm">Assigned</p><p className="text-2xl font-bold">{deviceStats?.assigned || 0}</p></div><Link className="w-10 h-10 text-purple-500" /></div></div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500"><div className="flex justify-between items-center"><div><p className="text-gray-500 text-sm">Fall Events</p><p className="text-2xl font-bold">{stats?.eventsByType?.FALL || 0}</p></div><AlertTriangle className="w-10 h-10 text-red-500" /></div></div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-500"><div className="flex justify-between items-center"><div><p className="text-gray-500 text-sm">Second Attempts</p><p className="text-2xl font-bold">{secondAttemptOrders.length}</p></div><RotateCcw className="w-10 h-10 text-orange-500" /></div></div>
      </div>
      <div className="flex gap-4 mb-4 border-b">
        <button onClick={() => setActiveTab('devices')} className={`pb-2 px-4 font-medium flex items-center gap-2 ${activeTab === 'devices' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><Smartphone className="w-4 h-4" />Devices{devices.length > 0 && <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{devices.length}</span>}</button>
        <button onClick={() => setActiveTab('events')} className={`pb-2 px-4 font-medium ${activeTab === 'events' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>📡 Events</button>
        <button onClick={() => setActiveTab('second-attempt')} className={`pb-2 px-4 font-medium flex items-center gap-2 ${activeTab === 'second-attempt' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>⚠️ Second Attempt Orders{secondAttemptOrders.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{secondAttemptOrders.length}</span>}</button>
      </div>
      {activeTab === 'devices' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100"><h3 className="font-semibold text-blue-800 flex items-center gap-2"><Smartphone className="w-5 h-5" />Registered IoT Devices</h3><p className="text-sm text-blue-600 mt-1">Devices auto-register when they connect. Assign devices to orders for tracking.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device ID</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Order</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Heartbeat</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Connection</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>) : devices.length === 0 ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500"><Smartphone className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>No devices registered.</p></td></tr>) : devices.map((d) => (
                  <tr key={d.deviceId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium">{d.deviceId}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeviceStatusColor(d.status)}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-sm">{d.assignedOrderId ? <span className="text-blue-600 font-medium">#{d.assignedOrderId.slice(-6)}</span> : <span className="text-gray-400">Not assigned</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-500"><Clock className="w-4 h-4 inline mr-1" />{formatTimestamp(d.lastHeartbeat)}</td>
                    <td className="px-4 py-3">{d.isOnline ? <span className="text-green-600 text-sm"><Wifi className="w-4 h-4 inline" /> Online</span> : <span className="text-gray-500 text-sm"><WifiOff className="w-4 h-4 inline" /> Offline</span>}</td>
                    <td className="px-4 py-3"><div className="flex gap-2">{d.status === 'AVAILABLE' && <button onClick={() => openAssignModal(d)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"><Link className="w-3 h-3 inline" /> Assign</button>}{d.assignedOrderId && <button onClick={() => handleReleaseDevice(d.assignedOrderId)} className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"><Unlink className="w-3 h-3 inline" /> Release</button>}<button onClick={() => handleDeleteDevice(d.deviceId)} className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200"><Trash2 className="w-3 h-3" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'events' && (
        <>
          <div className="flex gap-2 mb-4">{['all', 'unacknowledged', 'fall', 'critical'].map((f) => (<button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f === 'fall' ? '🚨 Falls' : f.charAt(0).toUpperCase() + f.slice(1)}</button>))}</div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (<tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</td></tr>) : events.length === 0 ? (<tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500"><Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>No events found.</p></td></tr>) : events.map((e) => (
                  <tr key={e.id} className={`hover:bg-gray-50 ${!e.acknowledged && e.eventType === 'FALL' ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">{getEventIcon(e.eventType)}</td>
                    <td className="px-4 py-3 font-mono text-sm">{e.deviceId}</td>
                    <td className="px-4 py-3 text-sm">{e.orderId ? <span className="text-blue-600">{e.orderId.slice(-6)}</span> : '-'}</td>
                    <td className="px-4 py-3"><span className="font-medium">{e.eventType}</span><p className="text-xs text-gray-500">{getEventDescription(e.eventType)}</p></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(e.severity)}`}>{e.severity}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500"><Clock className="w-4 h-4 inline mr-1" />{formatTimestamp(e.timestamp)}{e.offlineDurationMinutes && <p className="text-xs text-orange-600">Offline: {formatDuration(e.offlineDurationMinutes)}</p>}</td>
                    <td className="px-4 py-3">{e.acknowledged ? <span className="text-green-600 text-sm"><CheckCircle className="w-4 h-4 inline" /> Done</span> : <span className="text-yellow-600 text-sm"><Bell className="w-4 h-4 inline animate-pulse" /> Pending</span>}</td>
                    <td className="px-4 py-3">{!e.acknowledged && <button onClick={() => handleAcknowledge(e.id)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Acknowledge</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {activeTab === 'second-attempt' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 bg-orange-50 border-b border-orange-100"><h3 className="font-semibold text-orange-800"><AlertTriangle className="w-5 h-5 inline mr-2" />Orders Requiring Careful Handling</h3><p className="text-sm text-orange-600 mt-1">These orders had fall incidents.</p></div>
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempt #</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {secondAttemptOrders.length === 0 ? (<tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No orders with incidents.</td></tr>) : secondAttemptOrders.map((o) => (
                <tr key={o.id} className="hover:bg-orange-50">
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">{o.customerName}</td>
                  <td className="px-4 py-3 text-sm">{o.employeeName || '-'}</td>
                  <td className="px-4 py-3"><span className="font-mono text-sm">{o.iotDeviceId || '-'}</span>{o.iotDeviceActive ? <Wifi className="w-4 h-4 text-green-500 inline ml-1" /> : <WifiOff className="w-4 h-4 text-red-500 inline ml-1" />}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">#{o.attemptCount || 2}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${o.status === 'RETURNING_TO_HUB' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{o.previousIncidentNote || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Assign Device to Order</h2><button onClick={() => setShowAssignModal(false)}><X className="w-6 h-6 text-gray-500 hover:text-gray-700" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Device</label><div className="p-3 bg-gray-100 rounded-lg"><span className="font-mono font-medium">{selectedDevice?.deviceId}</span><span className={`ml-2 px-2 py-0.5 rounded text-xs ${getDeviceStatusColor(selectedDevice?.status)}`}>{selectedDevice?.status}</span></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Order <span className="text-red-500">*</span></label><select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"><option value="">-- Select an order --</option>{availableOrders.map((o) => (<option key={o.id} value={o.id}>{o.orderNumber} - {o.customerName} ({o.status})</option>))}</select>{availableOrders.length === 0 && <p className="text-xs text-orange-600 mt-1">No orders available.</p>}</div>
              <div className="flex gap-3 pt-4"><button onClick={() => setShowAssignModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button><button onClick={handleAssignDevice} disabled={!selectedOrderId} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"><Link className="w-4 h-4" />Assign</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
