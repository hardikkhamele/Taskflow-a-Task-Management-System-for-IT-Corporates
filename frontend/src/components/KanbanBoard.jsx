import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { formatDate, isOverdue } from '../utils/helpers';
import { Eye, Edit2, Trash2, ArrowRight, ArrowLeft, Plus, AlertCircle, Inbox, Clock, FileSearch, CheckCircle2 } from 'lucide-react';

const NAVY = '#1B3A6B';
const LINK = '#2A6BD6';

/* Status badge */
const StatusBadge = ({ status, dueDate }) => {
  const overdue = isOverdue(dueDate, status);
  if (overdue) return <span className="status-badge status-overdue">Overdue</span>;
  if (status === 'Completed') return <span className="status-badge status-completed">Completed</span>;
  if (status === 'On Going') return <span className="status-badge status-ongoing">On Going</span>;
  return <span className="status-badge status-pending">Pending</span>;
};

/* Priority badge */
const PriorityBadge = ({ priority }) => {
  const styles = {
    Critical: { background: '#FEE2E2', color: '#991B1B', border: '#EF4444' },
    High: { background: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
    Medium: { background: '#DBEAFE', color: '#1E40AF', border: '#3B82F6' },
    Low: { background: '#F0FDF4', color: '#166534', border: '#22C55E' },
  };
  const s = styles[priority] || styles.Medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 999,
      fontSize: 10.5, fontWeight: 700,
      background: s.background, color: s.color,
      border: `1.5px solid ${s.border}`,
    }}>
      {priority}
    </span>
  );
};

/* Column config */
const COL_DEFS = [
  { id: 'Pending', title: 'Pending', color: '#f51313ff', icon: Inbox, next: 'On Going' },
  { id: 'On Going', title: 'In Progress', color: '#F5A623', icon: Clock, prev: 'Pending', next: 'Completed' },
  { id: 'Review', title: 'In Review', color: '#4A80D4', icon: FileSearch, prev: 'On Going', next: 'Completed' },
  { id: 'Completed', title: 'Completed', color: '#2E8B57', icon: CheckCircle2, prev: 'On Going' },
];

const KanbanBoard = ({ tasks, onDeleteClick, canManage, onQuickStatusChange, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="content-panel" style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
        Loading Kanban board...
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const ongoingTasks = tasks.filter(t => t.status === 'On Going');
  const reviewTasks = tasks.filter(t => t.priority === 'Critical' || t.priority === 'High').slice(0, 3);
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const colTasks = [pendingTasks, ongoingTasks, reviewTasks, completedTasks];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {COL_DEFS.map((col, ci) => {
        const Icon = col.icon;
        return (
          <div key={col.id} style={{ background: '#F4F5F7', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 500, border: '1px solid #E2E8F0' }}>
            {/* Column header — exact spec: solid flat color, white bold text */}
            <div className="kanban-col-header" style={{ background: col.color }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon size={15} color="white" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{col.title}</span>
              </div>
              <span className="kanban-count-badge">{colTasks[ci].length}</span>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
              {colTasks[ci].length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#9CA3AF', fontSize: 12, border: '1px dashed #D1D5DB', borderRadius: 8, background: 'white', margin: '4px 0' }}>
                  No tasks here
                </div>
              ) : colTasks[ci].map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                const assigned = task.assignedTo || {};

                return (
                  <div key={task._id} style={{
                    background: 'white', borderRadius: 10,
                    border: `1px solid #E2E8F0`,
                    borderLeft: `3px solid ${col.color}`,
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 8,
                    transition: 'box-shadow 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
                  >
                    {/* Title + avatar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <Link to={`/tasks/${task._id}`} style={{ color: NAVY, fontWeight: 700, fontSize: 12.5, lineHeight: 1.35, flex: 1 }}>
                        {task.taskName}
                      </Link>
                      <Avatar src={assigned.avatar} name={assigned.name} className="w-7 h-7" textClassName="text-[10px]" />
                    </div>

                    {/* Project + Priority */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600, background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '1px 7px', borderRadius: 4, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.projectName}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {/* Status + due date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#9CA3AF' }}>
                      <StatusBadge status={task.status} dueDate={task.dueDate} />
                      <span style={{ color: overdue ? '#C0392B' : '#9CA3AF', fontWeight: overdue ? 700 : 400 }}>
                        {formatDate(task.dueDate)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #F0F4F8' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to={`/tasks/${task._id}`} title="View" style={{ padding: '3px 6px', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, background: '#F9FAFB', display: 'flex', alignItems: 'center' }}>
                          <Eye size={12} />
                        </Link>
                        {canManage && (
                          <>
                            <Link to={`/tasks/${task._id}/edit`} title="Edit" style={{ padding: '3px 6px', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, background: '#F9FAFB', display: 'flex', alignItems: 'center' }}>
                              <Edit2 size={12} />
                            </Link>
                            <button onClick={() => onDeleteClick(task._id)} title="Delete" style={{ padding: '3px 6px', color: '#C0392B', border: '1px solid #FECACA', borderRadius: 6, background: '#FEF2F2', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {col.prev && (
                          <button onClick={() => onQuickStatusChange(task._id, col.prev)}
                            style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#374151', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ArrowLeft size={10} />
                          </button>
                        )}
                        {col.next && (
                          <button onClick={() => onQuickStatusChange(task._id, col.next)}
                            style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, color: 'white', background: col.color, border: `1px solid ${col.color}`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add task footer */}
            <div style={{ padding: '8px', borderTop: '1px solid #E2E8F0', background: 'white' }}>
              <button onClick={() => navigate('/tasks/create')}
                style={{ width: '100%', padding: '7px 0', fontSize: 11.5, fontWeight: 600, color: '#6B7280', background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Plus size={13} /> Add Task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
