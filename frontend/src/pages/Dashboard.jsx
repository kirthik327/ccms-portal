import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  Plus,
  UserCheck,
  Zap,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Common States
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Pagination States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalComplaintsCount, setTotalComplaintsCount] = useState(0);

  // Admin Specific States
  const [stats, setStats] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' or 'students'

  // Fetch Complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        search,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        department: deptFilter,
      };
      const res = await axios.get('/api/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.data);
        setPages(res.data.pagination.pages);
        setTotalComplaintsCount(res.data.pagination.total);
      }
    } catch (err) {
      setError('Failed to fetch complaints list.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Admin Stats
  const fetchAdminStats = async () => {
    if (user.role === 'student') return;
    try {
      const statsRes = await axios.get('/api/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      const staffRes = await axios.get('/api/admin/staff');
      if (staffRes.data.success) {
        setStaffList(staffRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter, categoryFilter, priorityFilter, deptFilter]);

  useEffect(() => {
    fetchAdminStats();
  }, [user]);

  const fetchStudents = async () => {
    if (user?.role === 'student') return;
    try {
      setLoadingStudents(true);
      const res = await axios.get('/api/admin/students');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students list:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'student' && activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setPriorityFilter('');
    setDeptFilter('');
    setPage(1);
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint? This cannot be undone.')) {
      return;
    }
    try {
      const res = await axios.delete(`/api/complaints/${id}`);
      if (res.data.success) {
        fetchComplaints();
        // If admin, update stats
        if (user.role !== 'student') fetchAdminStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete complaint.');
    }
  };

  const handleAssign = async (id) => {
    if (!selectedStaff) return;
    try {
      const res = await axios.put(`/api/admin/assign/${id}`, { staffId: selectedStaff });
      if (res.data.success) {
        setAssigningId(null);
        setSelectedStaff('');
        fetchComplaints();
        fetchAdminStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign staff.');
    }
  };

  const handleStatusUpdate = async (id) => {
    if (!selectedStatus) return;
    try {
      const res = await axios.put(`/api/admin/status/${id}`, { status: selectedStatus });
      if (res.data.success) {
        setUpdatingStatusId(null);
        setSelectedStatus('');
        fetchComplaints();
        fetchAdminStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Badge Stylers
  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'High':
        return 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400';
      case 'Medium':
        return 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400';
      case 'In Progress':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const COLORS = ['#1e40af', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  const studentCategories = [
    'Infrastructure', 'Classroom', 'Laboratory', 'Library', 'Hostel',
    'Transport', 'Canteen', 'Wi-Fi / Internet', 'Electrical Issues',
    'Water Supply', 'Cleanliness', 'Sports Facilities', 'Faculty Related',
    'Anti-Ragging', 'Other'
  ];

  const studentDepts = [
    'Information Technology',
    'Computer Science and Engineering',
    'Aeronautical Engineering',
    'Food Technology',
    'Civil Engineering',
    'Agricultural Engineering',
    'Cyber Security',
    'Artificial Intelligence and Machine Learning',
    'Computer and Communication Engineering',
    'Science and Humanities(1st Year)',
    'Master of Business Administration(MBA)'
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-primary to-primary-light p-6 text-white shadow-lg shadow-primary/10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
          <p className="mt-1 text-sm font-medium text-blue-100/90">
            {user?.role === 'student'
              ? 'Campus Grievance Portal - submit issues and monitor active statuses.'
              : 'Administrative Control Desk - track reports, allocate staff, and record actions.'}
          </p>
        </div>
        {user?.role === 'student' && (
          <Link
            to="/submit-complaint"
            className="flex items-center justify-center gap-1.5 self-start rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-md hover:bg-slate-50 md:self-auto"
          >
            <Plus className="h-4 w-4" />
            File a Complaint
          </Link>
        )}
      </div>

      {/* RENDER STUDENT VIEW */}
      {user?.role === 'student' && (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Total Grievances</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{totalComplaintsCount}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Pending Actions</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected').length}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Resolved Cases</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {complaints.filter((c) => c.status === 'Resolved').length}
                </h3>
              </div>
            </div>
          </div>
        </>
      )}

      {/* RENDER ADMIN VIEW - ANALYTICS GRID */}
      {user?.role !== 'student' && stats && (
        <>
          {/* Admin KPI Counters */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-400">Total Cases</span>
              <h3 className="mt-1.5 text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</h3>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-400">Pending</span>
              <h3 className="mt-1.5 text-2xl font-bold text-slate-800 dark:text-white">{stats.pending}</h3>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-400">Resolved</span>
              <h3 className="mt-1.5 text-2xl font-bold text-slate-800 dark:text-white">{stats.resolved}</h3>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-400">High Priority</span>
              <h3 className="mt-1.5 text-2xl font-bold text-rose-500">{stats.highPriority}</h3>
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-400">Avg Resolve Time</span>
              <h3 className="mt-1.5 text-2xl font-bold text-indigo-500">
                {stats.averageResolutionTimeHours} hrs
              </h3>
            </div>
          </div>

          {/* User Registration Counters */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-4 rounded-3xl border p-5 shadow-sm transition-all text-left cursor-pointer w-full ${
                activeTab === 'students'
                  ? 'border-primary bg-primary/5 dark:border-primary-light dark:bg-slate-900'
                  : 'border-slate-200 bg-white hover:border-primary dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Total Registered Students</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalStudents || 0}</h3>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('complaints')}
              className={`flex items-center gap-4 rounded-3xl border p-5 shadow-sm transition-all text-left cursor-pointer w-full ${
                activeTab === 'complaints'
                  ? 'border-primary bg-primary/5 dark:border-primary-light dark:bg-slate-900'
                  : 'border-slate-200 bg-white hover:border-primary dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Total Staff / Admin Accounts</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalStaff || 0}</h3>
              </div>
            </button>
          </div>

          {/* Interactive Recharts Panels */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Monthly Trend Line */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <TrendingUp className="h-4 w-4 text-primary" />
                Monthly Grievance Inflow
              </h3>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Breakdown Donut */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Department-wise Breakdown</h3>
              <div className="mt-4 flex h-64 flex-col items-center justify-center">
                {stats.departmentStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.departmentStats}
                        dataKey="count"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {stats.departmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400">No data available</p>
                )}
                {/* Custom list description */}
                <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 overflow-y-auto max-h-16 text-[9px] font-bold text-slate-500">
                  {stats.departmentStats.map((item, idx) => (
                    <span key={item.department} className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      {item.department} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* COMPLAINTS FILTERING SECTION */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full border-b border-slate-100 dark:border-slate-800 pb-3">
          {user?.role !== 'student' ? (
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('complaints')}
                className={`text-sm font-bold pb-1 transition-all relative ${
                  activeTab === 'complaints'
                    ? 'text-primary dark:text-primary-light border-b-2 border-primary'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                Grievance Resolution Queue
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className={`text-sm font-bold pb-1 transition-all relative ${
                  activeTab === 'students'
                    ? 'text-primary dark:text-primary-light border-b-2 border-primary'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                Registered Students Directory
              </button>
            </div>
          ) : (
            <h3 className="text-md font-bold text-slate-800 dark:text-white">
              My Submitted Grievances
            </h3>
          )}
          
          {/* Search bar */}
          {activeTab === 'complaints' && (
            <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 md:max-w-xs">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 pr-4 pl-10 text-xs bg-transparent outline-none focus:border-primary dark:border-slate-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800"
              >
                <ArrowRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
            </form>
          )}
        </div>

        {/* Dropdowns row */}
        {activeTab === 'complaints' && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs bg-transparent dark:border-slate-800 dark:text-slate-300"
            >
              <option value="" className="dark:bg-slate-900">All Statuses</option>
              <option value="Submitted" className="dark:bg-slate-900">Submitted</option>
              <option value="Under Review" className="dark:bg-slate-900">Under Review</option>
              <option value="Assigned" className="dark:bg-slate-900">Assigned</option>
              <option value="In Progress" className="dark:bg-slate-900">In Progress</option>
              <option value="Resolved" className="dark:bg-slate-900">Resolved</option>
              <option value="Rejected" className="dark:bg-slate-900">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs bg-transparent dark:border-slate-800 dark:text-slate-300"
            >
              <option value="" className="dark:bg-slate-900">All Categories</option>
              {studentCategories.map((c) => (
                <option key={c} value={c} className="dark:bg-slate-900">{c}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs bg-transparent dark:border-slate-800 dark:text-slate-300"
            >
              <option value="" className="dark:bg-slate-900">All Priorities</option>
              <option value="Low" className="dark:bg-slate-900">Low Priority</option>
              <option value="Medium" className="dark:bg-slate-900">Medium Priority</option>
              <option value="High" className="dark:bg-slate-900">High Priority</option>
            </select>

            {user.role !== 'student' && (
              <select
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs bg-transparent dark:border-slate-800 dark:text-slate-300"
              >
                <option value="" className="dark:bg-slate-900">All Departments</option>
                {studentDepts.map((d) => (
                  <option key={d} value={d} className="dark:bg-slate-900">{d}</option>
                ))}
              </select>
            )}

            {(search || statusFilter || categoryFilter || priorityFilter || deptFilter) && (
              <button
                onClick={handleClearFilters}
                className="rounded-xl border border-rose-200 bg-rose-50/50 py-1.5 px-3.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* COMPLAINTS CONTENT */}
        {activeTab === 'complaints' && (
          <>
            {loading ? (
          <div className="mt-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-full rounded-2xl shimmer-loading"></div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 text-center text-xs text-rose-500">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">No grievances found</h4>
            <p className="mt-1 max-w-xs text-xs text-slate-400">
              Try adjusting your search criteria or filter tags.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            
            {/* RENDER STUDENT COMPLAINTS (Cards or Simple Row) */}
            {user.role === 'student' ? (
              <div className="space-y-4">
                {complaints.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition-all hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:hover:border-primary-light/45"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${getPriorityBadge(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</h4>
                      <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                        <span>Cat: {item.category}</span>
                        <span>Loc: {item.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:self-center">
                      <Link
                        to={`/complaints/${item._id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      {item.status === 'Submitted' && (
                        <>
                          <button
                            onClick={() => navigate('/submit-complaint', { state: { complaint: item } })}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400"
                            title="Edit Complaint"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComplaint(item._id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400"
                            title="Delete Complaint"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* RENDER ADMIN COMPLAINTS (Professional Table layout) */
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-850">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {complaints.map((item) => (
                    <tr
                      key={item._id}
                      className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-850/40"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {item.studentId?.name || 'Anonymous'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.studentId?.department || 'N/A'} • {item.studentId?.rollNumber || ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${getPriorityBadge(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {updatingStatusId === item._id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={selectedStatus}
                              onChange={(e) => setSelectedStatus(e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white p-1 text-[10px] dark:border-slate-800 dark:bg-slate-900"
                            >
                              <option value="Submitted">Submitted</option>
                              <option value="Assigned">Assigned</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                            <button
                              onClick={() => handleStatusUpdate(item._id)}
                              className="rounded-lg bg-primary px-2 py-1 text-[9px] font-bold text-white"
                            >
                              Go
                            </button>
                            <button
                              onClick={() => setUpdatingStatusId(null)}
                              className="rounded-lg border border-slate-200 p-1 text-[9px]"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${getStatusBadge(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                            <button
                              onClick={() => {
                                setUpdatingStatusId(item._id);
                                setSelectedStatus(item.status);
                              }}
                              className="rounded-lg p-1 text-slate-450 hover:text-primary hover:bg-slate-100 dark:text-slate-500 dark:hover:text-primary-light dark:hover:bg-slate-800 transition-colors"
                              title="Edit Status"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {assigningId === item._id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={selectedStaff}
                              onChange={(e) => setSelectedStaff(e.target.value)}
                              placeholder="Type Staff Name"
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] dark:border-slate-800 dark:bg-slate-900 max-w-[120px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/10"
                            />
                            <button
                              onClick={() => handleAssign(item._id)}
                              className="rounded-lg bg-primary px-2 py-1 text-[9px] font-bold text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setAssigningId(null)}
                              className="rounded-lg border border-slate-200 p-1 text-[9px]"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {item.assignedTo || 'Unassigned'}
                            </span>
                            <button
                              onClick={() => {
                                setAssigningId(item._id);
                                setSelectedStaff(item.assignedTo || '');
                              }}
                              className="rounded-lg p-1 text-slate-450 hover:text-primary hover:bg-slate-100 dark:text-slate-500 dark:hover:text-primary-light dark:hover:bg-slate-800 transition-colors"
                              title="Assign Staff"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/complaints/${item._id}`}
                            className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          {user.role !== 'student' && (
                            <button
                              onClick={() => handleDeleteComplaint(item._id)}
                              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400"
                              title="Delete Complaint"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* PAGINATION SECTION */}
            {pages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Page {page} of {pages} ({totalComplaintsCount} items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
        </>
      )}

      {/* REGISTERED STUDENTS DIRECTORY */}
      {activeTab === 'students' && user?.role !== 'student' && (
        <div className="mt-6 overflow-x-auto">
          {loadingStudents ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-3 text-xs text-slate-400">Loading student directory...</p>
            </div>
          ) : students.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-4">Student Name</th>
                  <th className="pb-3">Register Number</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3 pr-4">Year of Study</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {students.map((student) => (
                  <tr key={student._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="py-4 pl-4 font-bold text-slate-800 dark:text-white">{student.name}</td>
                    <td className="py-4 font-mono font-semibold text-slate-600 dark:text-slate-300">{student.rollNumber}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{student.email || 'N/A'}</td>
                    <td className="py-4 font-semibold text-slate-600 dark:text-slate-300">{student.department || 'N/A'}</td>
                    <td className="py-4 pr-4 font-semibold text-slate-600 dark:text-slate-300">{student.year || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-sm text-slate-400">No registered students found.</div>
          )}
        </div>
      )}
    </div>

    </div>
  );
};

export default Dashboard;
