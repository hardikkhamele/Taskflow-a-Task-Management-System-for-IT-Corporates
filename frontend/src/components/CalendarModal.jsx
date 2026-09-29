import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CalendarModal = ({ isOpen, onClose }) => {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();

  // Helper to parse due date from task
  const getTasksForDay = (dayNum, isCurrentMonth = true) => {
    if (!isCurrentMonth) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const tDate = new Date(t.dueDate);
      return (
        tDate.getFullYear() === year &&
        tDate.getMonth() === month &&
        tDate.getDate() === dayNum
      );
    });
  };

  // Build grid days
  const gridCells = [];
  // Prev month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    gridCells.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push({
      day: d,
      currentMonth: true,
      date: new Date(year, month, d),
    });
  }
  // Next month padding days to make full 6 rows (42 cells)
  const remainingCells = 42 - gridCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    gridCells.push({
      day: d,
      currentMonth: false,
      date: new Date(year, month + 1, d),
    });
  }

  const selectedDayTasks = selectedDate ? tasks.filter(t => {
    if (!t.dueDate) return false;
    const tDate = new Date(t.dueDate);
    return (
      tDate.getFullYear() === selectedDate.getFullYear() &&
      tDate.getMonth() === selectedDate.getMonth() &&
      tDate.getDate() === selectedDate.getDate()
    );
  }) : [];

  const isToday = (date) => {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isSelected = (date) => {
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 14,
        width: '100%',
        maxWidth: 920,
        maxHeight: '90vh',
        boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
      }}>
        {/* Header */}
        <div style={{
          background: '#14356E',
          color: 'white',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: '#C0392B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalendarIcon size={16} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                Task Schedule & Calendar
              </h3>
              <p style={{ fontSize: 11, color: '#B3C5E8', margin: 0, marginTop: 2 }}>
                Interactive task deadline planner & schedule overview
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 480 }}>
          {/* Calendar Grid Side */}
          <div style={{ flex: 1.4, padding: 20, borderRight: '1px solid #E2E8F0', overflowY: 'auto' }}>
            {/* Month Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1B3A6B' }}>
                {monthNames[month]} {year}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={prevMonth}
                  style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid #CBD5E1',
                    background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: '#334155',
                  }}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid #2A6BD6',
                    background: '#EAF0FB', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#2A6BD6',
                  }}
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid #CBD5E1',
                    background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: '#334155',
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6, textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div key={d} style={{ fontSize: 11, fontWeight: 700, color: i === 0 || i === 6 ? '#EF4444' : '#64748B', textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {gridCells.map((cell, idx) => {
                const dayTasks = getTasksForDay(cell.day, cell.currentMonth);
                const isSelectedDay = isSelected(cell.date);
                const isTodayDay = isToday(cell.date);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    style={{
                      height: 64,
                      borderRadius: 8,
                      border: isSelectedDay ? '2px solid #2A6BD6' : '1px solid #E2E8F0',
                      background: !cell.currentMonth ? '#F8FAFC' : isTodayDay ? '#EFF6FF' : '#FFFFFF',
                      padding: 5,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: cell.currentMonth ? 1 : 0.45,
                      transition: 'border 0.15s, background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: isTodayDay || isSelectedDay ? 800 : 600,
                        color: isTodayDay ? '#2A6BD6' : isSelectedDay ? '#1E40AF' : '#334155',
                        background: isTodayDay ? '#DBEAFE' : 'transparent',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {cell.day}
                      </span>
                    </div>

                    {/* Task Indicators */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dayTasks.slice(0, 2).map((t, ti) => (
                        <div key={ti} style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          background: t.status === 'Completed' ? '#DCFCE7' : t.status === 'On Going' ? '#FEF3C7' : '#F3F4F6',
                          color: t.status === 'Completed' ? '#166534' : t.status === 'On Going' ? '#92400E' : '#374151',
                          border: `1px solid ${t.status === 'Completed' ? '#86EFAC' : t.status === 'On Going' ? '#FDE68A' : '#E5E7EB'}`,
                        }}>
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#2A6BD6', textAlign: 'right' }}>
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Task Detail Sidebar */}
          <div style={{ flex: 1, padding: 20, background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', pb: 12, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Schedule for
                </span>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1B3A6B', margin: 0 }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
              </div>

              <Link
                to="/tasks/create"
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', background: '#2A6BD6', color: 'white',
                  borderRadius: 6, fontSize: 11, fontWeight: 700, textDecoration: 'none',
                }}
              >
                <Plus size={13} /> Add Task
              </Link>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedDayTasks.length === 0 ? (
                <div style={{
                  padding: 30, textAlign: 'center', color: '#94A3B8',
                  background: 'white', borderRadius: 10, border: '1px dashed #CBD5E1',
                  marginTop: 20,
                }}>
                  <Clock size={28} style={{ margin: '0 auto 8px', color: '#CBD5E1' }} />
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#64748B' }}>No tasks due on this date</p>
                  <p style={{ fontSize: 11, margin: '4px 0 0', color: '#94A3B8' }}>Select another date or create a new task schedule.</p>
                </div>
              ) : (
                selectedDayTasks.map(t => (
                  <div
                    key={t._id}
                    style={{
                      background: 'white',
                      borderRadius: 10,
                      padding: 12,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: t.priority === 'Critical' ? '#FEF2F2' : t.priority === 'High' ? '#FFF7ED' : '#F0FDF4',
                        color: t.priority === 'Critical' ? '#991B1B' : t.priority === 'High' ? '#C2410C' : '#15803D',
                      }}>
                        {t.priority || 'Medium'} Priority
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>
                        {t.projectName || 'General'}
                      </span>
                    </div>

                    <h5 style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: '4px 0 6px' }}>
                      {t.title}
                    </h5>

                    <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {t.description || 'No description provided.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', pt: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>
                        Assignee: {t.assignedUser?.name || 'Unassigned'}
                      </span>
                      <Link
                        to={`/tasks/${t._id}`}
                        onClick={onClose}
                        style={{ fontSize: 11, fontWeight: 700, color: '#2A6BD6' }}
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
