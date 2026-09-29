import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import Avatar from './Avatar';
import { formatDate, isOverdue } from '../utils/helpers';
import { Eye, Edit2, Trash2, Calendar, User as UserIcon, AlertCircle } from 'lucide-react';

const TaskTable = ({ tasks, onDeleteClick, canManage, onQuickStatusChange, loading }) => {
  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading tasks...</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No tasks found</h3>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Project Name</th>
            <th className="py-3.5 px-4">Task Name</th>
            <th className="py-3.5 px-4">Assigned To</th>
            <th className="py-3.5 px-4">Assigned By</th>
            <th className="py-3.5 px-4">Issue Date</th>
            <th className="py-3.5 px-4">Due Date</th>
            <th className="py-3.5 px-4">Priority</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const assignedToObj = task.assignedTo || {};
            const assignedToName = assignedToObj.name || 'Unassigned';
            const assignedToDesignation = assignedToObj.designation || '';
            const assignedToRole = assignedToObj.role || '';
            const assignedToAvatar = assignedToObj.avatar || '';

            const assignedByName = task.assignedBy?.name || 'System';

            return (
              <tr key={task._id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-3.5 px-4 font-semibold text-blue-600 max-w-[150px] truncate">
                  {task.projectName}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900 max-w-[220px]">
                  <div className="truncate" title={task.taskName}>
                    {task.taskName}
                  </div>
                  {overdue && (
                    <span className="inline-flex items-center text-[10px] font-bold text-rose-600 mt-0.5">
                      <AlertCircle className="w-3 h-3 mr-0.5" /> OVERDUE
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-2">
                    <Avatar src={assignedToAvatar} name={assignedToName} className="w-7 h-7" textClassName="text-[10px]" />
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">{assignedToName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {assignedToDesignation ? `${assignedToDesignation} • ` : ''}
                        {assignedToRole}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span>{assignedByName}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(task.issueDate)}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                    {formatDate(task.dueDate)}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {canManage ? (
                      <>
                        <Link
                          to={`/tasks/${task._id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => onDeleteClick(task._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <Link
                        to={`/tasks/${task._id}/edit`}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
