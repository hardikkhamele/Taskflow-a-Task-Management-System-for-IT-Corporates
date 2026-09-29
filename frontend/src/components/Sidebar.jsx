import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, ListTodo, PlusCircle, User, LogOut, ChevronsLeft } from 'lucide-react';

const INACTIVE_COLOR = '#374151';
const ACTIVE_BLUE    = '#2A6BD6';

const Sidebar = () => {
  const { isAdminOrManager, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home',           path: '/',              icon: Home,       end: true },
    { label: 'Task Directory', path: '/tasks',         icon: ListTodo,   end: false },
    ...(isAdminOrManager ? [{ label: 'Create Task', path: '/tasks/create', icon: PlusCircle, end: false }] : []),
    { label: 'Profile & Team', path: '/profile',       icon: User,       end: false },
  ];

  return (
    <aside style={{
      width: 230,
      minWidth: 230,
      background: '#FFFFFF',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, "Segoe UI", Roboto, sans-serif',
      position: 'sticky',
      top: 92,
      alignSelf: 'flex-start',
      height: 'calc(100vh - 92px)',
      zIndex: 20,
    }}>
      {/* Nav items */}
      <nav style={{ flex: 1, position: 'relative' }}>
        {navItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            style={({ isActive }) => ({
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 18px',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              lineHeight: 1.2,
              color: isActive ? ACTIVE_BLUE : INACTIVE_COLOR,
              background: 'transparent',
              borderLeft: 'none',
              borderBottom: '1px solid #E5E7EB',
              textDecoration: 'none',
              transition: 'background 0.1s, color 0.1s',
              cursor: 'pointer',
            })}
            onMouseEnter={e => {
              if (e.currentTarget.style.color !== ACTIVE_BLUE && e.currentTarget.style.color !== 'rgb(42, 107, 214)') {
                e.currentTarget.style.background = '#F8F9FA';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} color={isActive ? ACTIVE_BLUE : INACTIVE_COLOR} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                <span>{label}</span>

                {/* Active Indicator: Solid right-pointing triangle (▶ shape) flat-based flush against sidebar's right edge */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    right: -12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '7px solid transparent',
                    borderBottom: '7px solid transparent',
                    borderLeft: '12px solid #2A6BD6',
                    zIndex: 30,
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 18px', fontSize: 14, fontWeight: 400,
            lineHeight: 1.2,
            color: INACTIVE_COLOR, background: 'none', border: 'none',
            borderTop: '1px solid #E5E7EB',
            cursor: 'pointer', width: '100%', textAlign: 'left',
            fontFamily: 'inherit',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F8F9FA'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} color={INACTIVE_COLOR} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          Logout
        </button>

        {/* Collapse toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', borderTop: '1px solid #E5E7EB' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#EAECEF', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#D1D5DB'}
            onMouseLeave={e => e.currentTarget.style.background = '#EAECEF'}
          >
            <ChevronsLeft size={14} color="#6B7280" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
