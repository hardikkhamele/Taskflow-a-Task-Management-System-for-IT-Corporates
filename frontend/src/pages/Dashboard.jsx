import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { AuthContext } from '../context/AuthContext';
import DeleteModal from '../components/DeleteModal';
import { PlusCircle, ArrowRight, BarChart2, Calendar, AlertCircle } from 'lucide-react';
import { formatDate, isOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';

const NAVY = '#1B3A6B';
const LINK = '#2A6BD6';

/* Card palette — exactly as specified */
const CARD_COLORS = ['#2DD4A0', '#F4516C', '#4A80D4', '#F5A623', '#8E44AD', '#2C3E50'];

/* Progress bar colors per category */
const BAR_COLORS = {
  completed:    '#2DD4A0',
  ongoing:      '#F5A623',
  pending:      '#F4516C',
  highPriority: '#8E44AD',
};

/* Status badge helper */
const StatusBadge = ({ status, dueDate }) => {
  const overdue = isOverdue(dueDate, status);
  if (overdue) return <span className="status-badge status-overdue">Overdue</span>;
  if (status === 'Completed')  return <span className="status-badge status-completed">Completed</span>;
  if (status === 'On Going')   return <span className="status-badge status-ongoing">On Going</span>;
  return <span className="status-badge status-pending">Pending</span>;
};

const Dashboard = () => {
  const { user, isAdminOrManager } = useContext(AuthContext);
  const { stats, tasks, loading, removeTask } = useTasks();
  const [deleteModalId, setDeleteModalId] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;
    const res = await removeTask(deleteModalId);
    setDeleteModalId(null);
    if (res.success) toast.success('Task deleted');
  };

  const totalTasks = stats.totalTasks || 0;

  const statCards = [
    { label: 'Total Tasks',    value: stats.totalTasks    ?? 0, color: CARD_COLORS[0] },
    { label: 'Overdue Tasks',  value: stats.overdueTasks  ?? 0, color: CARD_COLORS[1] },
    { label: 'In Progress',    value: stats.onGoingTasks  ?? 0, color: CARD_COLORS[2] },
    { label: 'Completed',      value: stats.completedTasks ?? 0, color: CARD_COLORS[3] },
    { label: 'High Priority',  value: stats.highPriorityTasks ?? 0, color: CARD_COLORS[4] },
    { label: 'Pending Tasks',  value: stats.pendingTasks  ?? 0, color: CARD_COLORS[5] },
  ];

  const progressBars = [
    { label: 'Completed',    value: stats.completedTasks ?? 0,      color: BAR_COLORS.completed },
    { label: 'In Progress',  value: stats.onGoingTasks   ?? 0,      color: BAR_COLORS.ongoing },
    { label: 'Pending',      value: stats.pendingTasks   ?? 0,      color: BAR_COLORS.pending },
    { label: 'High Priority',value: stats.highPriorityTasks ?? 0,   color: BAR_COLORS.highPriority },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ─── Stat Cards Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ background: card.color }}>
            <span className="stat-card-label">{card.label}</span>
            <span className="stat-card-value">{card.value}</span>
          </div>
        ))}
      </div>

      {/* ─── Main Content Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Recent Tasks Table */}
        <div className="content-panel">
          <div className="panel-header">
            <span className="panel-title">
              <Calendar size={15} style={{ color: LINK }} />
              Recent Tasks Activity
            </span>
            <Link to="/tasks" className="panel-view-all">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>No tasks found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 8).map((task) => (
                    <tr key={task._id}>
                      <td><Link to={`/tasks/${task._id}`}>{task.taskName}</Link></td>
                      <td style={{ color: '#6B7280' }}>{task.projectName}</td>
                      <td><StatusBadge status={task.status} dueDate={task.dueDate} /></td>
                      <td style={{ color: '#6B7280', fontSize: 12 }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Task Distribution */}
          <div className="content-panel">
            <div className="panel-header">
              <span className="panel-title">
                <BarChart2 size={15} style={{ color: LINK }} />
                Task Distribution
              </span>
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {progressBars.map((bar) => {
                const pct = totalTasks > 0 ? Math.round((bar.value / totalTasks) * 100) : 0;
                return (
                  <div key={bar.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                      <span>{bar.label}</span>
                      <span style={{ color: '#6B7280', fontWeight: 500 }}>{bar.value}/{totalTasks}</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: bar.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          {isAdminOrManager && (
            <div className="content-panel">
              <div className="panel-header">
                <span className="panel-title">Quick Actions</span>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/tasks/create" className="quick-btn" style={{ background: '#2E8B57' }}>
                  <PlusCircle size={15} /> Create New Task
                </Link>
                <Link to="/tasks" className="quick-btn" style={{ background: NAVY }}>
                  <ArrowRight size={15} /> View All Tasks
                </Link>
                <Link to="/profile" className="quick-btn" style={{ background: '#F5A623' }}>
                  <ArrowRight size={15} /> Team & Profile Management
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={Boolean(deleteModalId)}
        onClose={() => setDeleteModalId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to permanently remove this task?"
      />
    </div>
  );
};

export default Dashboard;
