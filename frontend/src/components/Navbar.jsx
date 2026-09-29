import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';
import CalendarModal from './CalendarModal';
import { Bell, FileText, Settings, Calendar, ChevronDown, LogOut, User, Home, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard Overview';
    if (p === '/tasks') return 'Task Directory & Board';
    if (p === '/tasks/create') return 'Create New Task';
    if (p.startsWith('/tasks/') && p.endsWith('/edit')) return 'Edit Task';
    if (p.startsWith('/tasks/')) return 'Task Details';
    if (p === '/profile') return 'Profile & Team Management';
    return 'Dashboard';
  };

  const getBreadcrumb = () => getPageTitle();

  const handleIconClick = (index) => {
    if (index === 3) {
      setCalendarOpen(true);
    } else if (index === 2) {
      navigate('/profile');
    } else if (index === 1) {
      navigate('/tasks');
    } else if (index === 0) {
      toast.success('19 Unread Task Notifications');
    }
  };

  const iconButtons = [
    { bg: '#4B5563', icon: Bell,     badge: '19', badgeBg: '#374151', title: 'Notifications' },
    { bg: '#7C2D5E', icon: FileText, badge: '4',  badgeBg: '#E74C3C', title: 'Task Documents' },
    { bg: '#2E8B57', icon: Settings, badge: null, title: 'Profile & Settings' },
    { bg: '#C0392B', icon: Calendar, badge: null, title: 'Schedule Calendar' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40 }}>
      {/* ── Main navy header ── */}
      <div style={{
        background: '#14356E',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 0,
      }}>
        {/* Logo box */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFC933 0%, #FF8C00 100%)',
            width: 200,
            height: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px 0 16px',
            marginLeft: -16,
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
          }}>
            <span style={{
              fontWeight: 900,
              fontSize: 18,
              color: '#1B3A6B',
              letterSpacing: -0.2,
              fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
              lineHeight: 1,
            }}>TASKFLOW</span>
            <span style={{
              fontSize: 8.5,
              fontWeight: 700,
              color: '#1B3A6B',
              letterSpacing: 1.5,
              opacity: 0.85,
              marginTop: 1,
            }}>ENTERPRISE</span>
          </div>
        </Link>

        {/* Page title */}
        <div style={{ flex: 1, paddingLeft: 20 }}>
          <span style={{ color: 'white', fontSize: 18, fontWeight: 500 }}>
            {getPageTitle()}
          </span>
        </div>

        {/* Icon cluster — continuous strip of 38x38px adjacent squares touching edge-to-edge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {iconButtons.map(({ bg, icon: Icon, badge, badgeBg, title }, i) => (
            <button
              key={i}
              onClick={() => handleIconClick(i)}
              title={title}
              style={{
                position: 'relative',
                width: 38,
                height: 38,
                background: bg,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                color: 'white',
                padding: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Icon size={18} color="white" />
              {badge != null && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: badgeBg,
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid white',
                  zIndex: 2,
                }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 14px Gap to User profile section */}
        <div style={{ width: 14 }} />

        {/* User Profile Section */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', display: 'flex', flexShrink: 0 }}>
              <Avatar src={user?.avatar} name={user?.name} className="w-9 h-9" textClassName="text-xs" />
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>
                {user?.name ? `${user.name.split(' ')[0].toUpperCase()} ${(user.name.split(' ')[1] || '').toUpperCase()}` : 'OPERATOR'}
              </div>
              <div style={{ fontSize: 11, color: '#B3C5E8', fontWeight: 400, lineHeight: 1.1 }}>
                {user?.designation || 'Associate'}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: 'white', flexShrink: 0, marginLeft: 2 }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 10px)',
              width: 240, background: 'white', borderRadius: 10,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
              zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 12 }}>
                <Avatar src={user?.avatar} name={user?.name} className="w-10 h-10" textClassName="text-sm" />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1B3A6B' }}>{user?.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#2A6BD6', marginTop: 1 }}>{user?.designation} • {user?.role}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                </div>
              </div>

              <Link to="/profile" onClick={() => setDropdownOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', fontSize: 13, color: '#333', borderBottom: '1px solid #F0F4F8', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <User size={14} style={{ color: '#6B7280' }} /> Profile & Team Management
              </Link>

              <button onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', fontSize: 13, fontWeight: 700, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Breadcrumb bar ── */}
      <div className="breadcrumb-bar" style={{ height: 36, display: 'flex', alignItems: 'center' }}>
        <Home size={14} style={{ color: '#2A6BD6', flexShrink: 0 }} />
        <Link to="/" style={{ color: '#2A6BD6', fontWeight: 500, fontSize: 13 }}>Home</Link>
        {getBreadcrumb() !== 'Dashboard Overview' && (
          <>
            <ChevronRight size={11} className="sep" />
            <span style={{ color: '#6B7280', fontSize: 13 }}>{getBreadcrumb()}</span>
          </>
        )}
        {getBreadcrumb() === 'Dashboard Overview' && (
          <>
            <ChevronRight size={11} className="sep" />
            <span style={{ color: '#6B7280', fontSize: 13 }}>Dashboard</span>
          </>
        )}
      </div>

      {/* Calendar Modal */}
      <CalendarModal isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </header>
  );
};

export default Navbar;
