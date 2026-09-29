import { useState, useEffect, useCallback, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Initial Mock Tasks for instant offline demo/preview
const DEFAULT_INITIAL_TASKS = [
  {
    _id: 't-1001',
    projectName: 'Enterprise CRM Portal',
    taskName: 'Design JWT Authentication Middleware & Route Guards',
    assignedTo: { _id: 'u-103', name: 'John Doe', email: 'john@example.com', role: 'Employee' },
    assignedBy: { _id: 'u-101', name: 'Alex Rivera', email: 'admin@example.com', role: 'Admin' },
    status: 'Completed',
    priority: 'High',
    issueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    description: 'Implement secure JWT token verification with bearer header parsing and role-based route protection.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: 't-1002',
    projectName: 'Enterprise CRM Portal',
    taskName: 'Build Analytics Dashboard UI & Quick Stats Cards',
    assignedTo: { _id: 'u-104', name: 'Emily Watson', email: 'emily@example.com', role: 'Employee' },
    assignedBy: { _id: 'u-102', name: 'Sarah Connor', email: 'manager@example.com', role: 'Manager' },
    status: 'On Going',
    priority: 'Critical',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    description: 'Construct top statistics cards, recent tasks table, and interactive status filter dropdowns.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 't-1003',
    projectName: 'Payment Gateway Integration',
    taskName: 'Stripe Webhook Listener & Error Handling',
    assignedTo: { _id: 'u-103', name: 'John Doe', email: 'john@example.com', role: 'Employee' },
    assignedBy: { _id: 'u-102', name: 'Sarah Connor', email: 'manager@example.com', role: 'Manager' },
    status: 'Pending',
    priority: 'High',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(), // Overdue
    description: 'Set up Stripe checkout session webhook listener with idempotency key checks.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 't-1004',
    projectName: 'Mobile App API',
    taskName: 'Refactor Task Filtering & Pagination Queries',
    assignedTo: { _id: 'u-104', name: 'Emily Watson', email: 'emily@example.com', role: 'Employee' },
    assignedBy: { _id: 'u-101', name: 'Alex Rivera', email: 'admin@example.com', role: 'Admin' },
    status: 'On Going',
    priority: 'Medium',
    issueDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    description: 'Optimize MongoDB text search index and aggregate counts for fast pagination.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: 't-1005',
    projectName: 'Internal Tools',
    taskName: 'User Profile & Password Update Settings',
    assignedTo: { _id: 'u-103', name: 'John Doe', email: 'john@example.com', role: 'Employee' },
    assignedBy: { _id: 'u-102', name: 'Sarah Connor', email: 'manager@example.com', role: 'Manager' },
    status: 'Pending',
    priority: 'Low',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    description: 'Create responsive user settings tab with form validation and password modification.',
    createdAt: new Date().toISOString(),
  },
];

export const useTasks = () => {
  const { user, usersList } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  
  // Persist tasks in localStorage so changes stay saved across page refresh
  const [localTasks, setLocalTasks] = useState(() => {
    const saved = localStorage.getItem('task_app_mock_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_INITIAL_TASKS;
  });

  const saveLocalTasks = (taskList) => {
    setLocalTasks(taskList);
    localStorage.setItem('task_app_mock_tasks', JSON.stringify(taskList));
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    onGoingTasks: 0,
    overdueTasks: 0,
    highPriorityTasks: 0,
    todayTasks: 0,
    weekTasks: 0,
    recentTasks: [],
  });

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch Tasks from API or compute local persistent list
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        search,
        status: statusFilter,
        priority: priorityFilter,
        assignedTo: assignedFilter,
        sortBy,
      };

      const res = await API.get('/tasks', { params });
      setTasks(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.total);
      setLoading(false);
    } catch (err) {
      let filtered = [...localTasks];

      if (user && user.role === 'Employee') {
        filtered = filtered.filter((t) => (t.assignedTo?._id || t.assignedTo) === user._id);
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.projectName.toLowerCase().includes(s) ||
            t.taskName.toLowerCase().includes(s)
        );
      }

      if (statusFilter !== 'All') {
        filtered = filtered.filter((t) => t.status === statusFilter);
      }

      if (priorityFilter !== 'All') {
        filtered = filtered.filter((t) => t.priority === priorityFilter);
      }

      if (assignedFilter !== 'All') {
        filtered = filtered.filter(
          (t) => (t.assignedTo?._id || t.assignedTo) === assignedFilter
        );
      }

      // Sort
      filtered.sort((a, b) => {
        if (sortBy === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'Due Date') return new Date(a.dueDate) - new Date(b.dueDate);
        return 0;
      });

      const limit = 10;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      setTasks(paginated);
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / limit) || 1);
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, assignedFilter, sortBy, user, localTasks]);

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get('/tasks/stats');
      setStats(res.data.data);
    } catch (err) {
      let scoped = [...localTasks];
      if (user && user.role === 'Employee') {
        scoped = scoped.filter((t) => (t.assignedTo?._id || t.assignedTo) === user._id);
      }

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      setStats({
        totalTasks: scoped.length,
        completedTasks: scoped.filter((t) => t.status === 'Completed').length,
        pendingTasks: scoped.filter((t) => t.status === 'Pending').length,
        onGoingTasks: scoped.filter((t) => t.status === 'On Going').length,
        overdueTasks: scoped.filter(
          (t) => t.status !== 'Completed' && new Date(t.dueDate) < now
        ).length,
        highPriorityTasks: scoped.filter((t) =>
          ['High', 'Critical'].includes(t.priority)
        ).length,
        todayTasks: scoped.filter((t) => {
          const d = new Date(t.dueDate);
          return d >= startOfToday && d <= endOfToday;
        }).length,
        weekTasks: scoped.length,
        recentTasks: scoped.slice(0, 5),
      });
    }
  }, [user, localTasks]);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Add Task
  const addTask = async (taskData) => {
    try {
      const res = await API.post('/tasks', taskData);
      fetchTasks();
      fetchStats();
      return { success: true, data: res.data.data };
    } catch (err) {
      // Find assigned user object from list for display
      const assignedUserObj = usersList.find((u) => u._id === taskData.assignedTo) || {
        _id: taskData.assignedTo,
        name: 'Assigned User',
      };

      const newTask = {
        _id: `t-${Date.now()}`,
        ...taskData,
        assignedTo: assignedUserObj,
        assignedBy: { _id: user?._id || 'u-101', name: user?.name || 'Admin', role: user?.role || 'Admin' },
        createdAt: new Date().toISOString(),
      };
      
      const updatedList = [newTask, ...localTasks];
      saveLocalTasks(updatedList);
      return { success: true, data: newTask, isMock: true };
    }
  };

  // Edit Task
  const editTask = async (id, taskData) => {
    try {
      const res = await API.put(`/tasks/${id}`, taskData);
      fetchTasks();
      fetchStats();
      return { success: true, data: res.data.data };
    } catch (err) {
      const updated = localTasks.map((t) => {
        if (t._id === id) {
          let updatedAssignedTo = t.assignedTo;
          if (taskData.assignedTo && typeof taskData.assignedTo === 'string') {
            updatedAssignedTo = usersList.find((u) => u._id === taskData.assignedTo) || {
              _id: taskData.assignedTo,
              name: 'Assigned User',
            };
          }
          return { ...t, ...taskData, assignedTo: updatedAssignedTo };
        }
        return t;
      });
      saveLocalTasks(updated);
      return { success: true, isMock: true };
    }
  };

  // Delete Task
  const removeTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
      fetchStats();
      return { success: true };
    } catch (err) {
      const updated = localTasks.filter((t) => t._id !== id);
      saveLocalTasks(updated);
      return { success: true, isMock: true };
    }
  };

  // Get Single Task details
  const getTask = async (id) => {
    try {
      const res = await API.get(`/tasks/${id}`);
      return { success: true, data: res.data.data };
    } catch (err) {
      const found = localTasks.find((t) => t._id === id);
      if (found) return { success: true, data: found };
      return { success: false, message: 'Task not found' };
    }
  };

  return {
    tasks,
    stats,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalCount,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    assignedFilter,
    setAssignedFilter,
    sortBy,
    setSortBy,
    addTask,
    editTask,
    removeTask,
    getTask,
    refreshTasks: fetchTasks,
  };
};
