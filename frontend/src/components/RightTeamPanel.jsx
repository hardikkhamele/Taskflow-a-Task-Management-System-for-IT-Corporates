import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RightTeamPanel = () => {
  const { usersList, user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <aside className="w-16 bg-[#232b38] border-l border-slate-800 min-h-[calc(100vh-57px)] py-4 flex flex-col items-center space-y-4 shrink-0 hidden lg:flex select-none">
      {/* Top Add Member Button (Blue Circle) */}
      <button
        onClick={() => {
          if (isAdmin) {
            navigate('/profile');
          }
        }}
        title={isAdmin ? "Add New Team Member" : "Team Members"}
        className="w-10 h-10 rounded-full bg-[#00aeff] hover:bg-[#0092d6] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 group"
      >
        <UserPlus className="w-5 h-5" />
      </button>

      <div className="w-8 h-px bg-slate-700/60 my-1"></div>

      {/* Vertical Stack of User Avatars */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] px-2 no-scrollbar">
        {usersList.map((member) => {
          const isSelf = member._id === user?._id;
          return (
            <div
              key={member._id}
              className="relative group flex justify-center cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <div className="relative">
                <Avatar
                  src={member.avatar}
                  name={member.name}
                  className={`w-10 h-10 border-2 transition-all group-hover:scale-110 ${
                    isSelf ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-700 group-hover:border-[#00aeff]'
                  }`}
                  textClassName="text-xs font-bold"
                />
                {/* Online Status Dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#232b38]"></span>
              </div>

              {/* Hover Tooltip Box */}
              <div className="absolute right-14 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-slate-900 text-white text-xs py-2 px-3 rounded-xl shadow-2xl border border-slate-700 whitespace-nowrap z-50 animate-in fade-in slide-in-from-right-2 duration-150">
                <p className="font-bold text-white leading-tight">{member.name}</p>
                <p className="text-[10px] font-semibold text-[#00aeff] mt-0.5">
                  {member.designation || 'Associate'} • {member.role || 'Member'}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{member.email}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default RightTeamPanel;
