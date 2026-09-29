import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { AuthContext } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import DeleteModal from '../components/DeleteModal';
import { PlusCircle, LayoutGrid, Table as TableIcon, X, Search, ArrowRight } from 'lucide-react';
import { formatDate, isOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';

const NAVY = '#1B3A6B';
const LINK = '#2A6BD6';

/* Status badge for table view */
const StatusBadge = ({ status, dueDate }) => {
  const overdue = isOverdue(dueDate, status);
  if (overdue) return <span className="status-badge status-overdue">Overdue</span>;
  if (status === 'Completed')  return <span className="status-badge status-completed">Completed</span>;
  if (status === 'On Going')   return <span className="status-badge status-ongoing">On Going</span>;
  return <span className="status-badge status-pending">Pending</span>;
};

/* Priority pill */
const PriorityPill = ({ priority }) => {
  const map = {
    Critical: { bg: '#FEE2E2', txt: '#991B1B', bd: '#EF4444' },
    High:     { bg: '#FEF3C7', txt: '#92400E', bd: '#F59E0B' },
    Medium:   { bg: '#DBEAFE', txt: '#1E40AF', bd: '#3B82F6' },
    Low:      { bg: '#F0FDF4', txt: '#166534', bd: '#22C55E' },
  };
  const s = map[priority] || map.Medium;
  return <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: s.bg, color: s.txt, border: `1.5px solid ${s.bd}` }}>{priority}</span>;
};

const TaskList = () => {
  const { isAdminOrManager } = useContext(AuthContext);
  const { tasks, loading, removeTask, editTask } = useTasks();

  const [viewMode, setViewMode] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteModalId, setDeleteModalId] = useState(null);

  const handleQuickStatusChange = async (taskId, newStatus) => {
    const res = await editTask(taskId, { status: newStatus });
    if (res.success) toast.success(`Moved to "${newStatus}"`);
    else toast.error('Failed to update status');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;
    const res = await removeTask(deleteModalId);
    setDeleteModalId(null);
    if (res.success) toast.success('Task deleted');
  };

  const filteredTasks = tasks.filter((task) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = task.taskName?.toLowerCase().includes(q) || task.projectName?.toLowerCase().includes(q) || task.assignedTo?.name?.toLowerCase().includes(q);
    const matchStatus   = statusFilter   ? task.status   === statusFilter   : true;
    const matchPriority = priorityFilter ? task.priority === priorityFilter : true;
    return matchSearch && matchStatus && matchPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'newest')   return new Date(b.createdAt || b.issueDate) - new Date(a.createdAt || a.issueDate);
    if (sortBy === 'oldest')   return new Date(a.createdAt || a.issueDate) - new Date(b.createdAt || b.issueDate);
    if (sortBy === 'dueDate')  return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === 'priority') {
      const p = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (p[b.priority] || 0) - (p[a.priority] || 0);
    }
    return 0;
  });

  const resetFilters = () => { setSearchTerm(''); setStatusFilter(''); setPriorityFilter(''); setSortBy('newest'); };
  const hasFilters = searchTerm || statusFilter || priorityFilter || sortBy !== 'newest';

  const selectStyle = { padding: '7px 10px', fontSize: 12.5, border: '1px solid #D1D5DB', borderRadius: 8, background: '#F9FAFB', color: '#374151', outline: 'none', fontFamily: 'inherit' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ─── Page header panel ─── */}
      <div className="content-panel" style={{ borderRadius: 10 }}>
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Task Directory & Board</h2>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '3px 0 0' }}>Manage, assign, and track all project tasks</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid #D1D5DB', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={() => setViewMode('kanban')} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, background: viewMode === 'kanban' ? NAVY : 'white', color: viewMode === 'kanban' ? 'white' : '#6B7280', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
                <LayoutGrid size={13} /> Kanban
              </button>
              <button onClick={() => setViewMode('table')} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, background: viewMode === 'table' ? NAVY : 'white', color: viewMode === 'table' ? 'white' : '#6B7280', border: 'none', borderLeft: '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
                <TableIcon size={13} /> Table
              </button>
            </div>
            {isAdminOrManager && (
              <Link to="/tasks/create" style={{ padding: '7px 14px', background: '#2E8B57', color: 'white', fontSize: 12, fontWeight: 700, textDecoration: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <PlusCircle size={13} /> Create Task
              </Link>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', background: '#FAFBFC', borderBottom: '1px solid #F0F4F8' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search tasks, projects or members..."
              style={{ ...selectStyle, paddingLeft: 30, width: '100%' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="On Going">On Going</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={selectStyle}>
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="dueDate">By Due Date</option>
            <option value="priority">By Priority</option>
          </select>
          {hasFilters && (
            <button onClick={resetFilters} style={{ padding: '7px 12px', fontSize: 11.5, fontWeight: 700, color: '#C0392B', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={12} /> Reset
            </button>
          )}
          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>
            Showing <b style={{ color: '#374151' }}>{sortedTasks.length}</b> of <b style={{ color: '#374151' }}>{tasks.length}</b>
          </span>
        </div>
      </div>

      {/* ─── Board / Table ─── */}
      {viewMode === 'kanban' ? (
        <KanbanBoard tasks={sortedTasks} loading={loading} canManage={isAdminOrManager} onDeleteClick={id => setDeleteModalId(id)} onQuickStatusChange={handleQuickStatusChange} />
      ) : (
        <div className="content-panel">
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Task Name</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    {isAdminOrManager && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>No tasks found</td></tr>
                  ) : sortedTasks.map((task, i) => (
                    <tr key={task._id}>
                      <td style={{ color: '#9CA3AF', fontSize: 11 }}>{i + 1}</td>
                      <td><Link to={`/tasks/${task._id}`}>{task.taskName}</Link></td>
                      <td style={{ color: '#6B7280' }}>{task.projectName}</td>
                      <td style={{ color: '#374151' }}>{task.assignedTo?.name || 'Unassigned'}</td>
                      <td><StatusBadge status={task.status} dueDate={task.dueDate} /></td>
                      <td><PriorityPill priority={task.priority} /></td>
                      <td style={{ fontSize: 12, color: '#6B7280' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                      {isAdminOrManager && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <Link to={`/tasks/${task._id}/edit`} style={{ fontSize: 11, fontWeight: 600, color: LINK, background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: 6, textDecoration: 'none' }}>Edit</Link>
                            <button onClick={() => setDeleteModalId(task._id)} style={{ fontSize: 11, fontWeight: 600, color: '#C0392B', background: '#FEF2F2', border: '1px solid #FECACA', padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <DeleteModal isOpen={Boolean(deleteModalId)} onClose={() => setDeleteModalId(null)} onConfirm={handleDeleteConfirm} title="Delete Task" message="Are you sure you want to permanently remove this task?" />
    </div>
  );
};

export default TaskList;
