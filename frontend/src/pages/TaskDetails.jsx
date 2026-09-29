import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { AuthContext } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import DeleteModal from '../components/DeleteModal';
import { formatDate, isOverdue } from '../utils/helpers';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  FolderKanban,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TaskDetails = () => {
  const { id } = useParams();
  const { getTask, removeTask } = useTasks();
  const { isAdminOrManager } = useContext(AuthContext);
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      const res = await getTask(id);
      if (res.success && res.data) {
        setTask(res.data);
      } else {
        toast.error('Task not found');
        navigate('/tasks');
      }
      setLoading(false);
    };

    fetchTask();
  }, [id]);

  const handleDeleteConfirm = async () => {
    const res = await removeTask(id);
    setDeleteModalOpen(false);
    if (res.success) {
      toast.success('Task deleted successfully');
      navigate('/tasks');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading task details...</p>
      </div>
    );
  }

  if (!task) return null;

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/tasks"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              {task.projectName}
            </span>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{task.taskName}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/tasks/${id}/edit`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-semibold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isAdminOrManager ? 'Edit Task' : 'Update Status'}</span>
          </Link>

          {isAdminOrManager && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Overdue alert banner */}
      {overdue && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold">Task Overdue Notice</p>
            <p className="font-normal text-rose-700 mt-0.5">
              This task was scheduled to complete by {formatDate(task.dueDate)} and requires immediate attention.
            </p>
          </div>
        </div>
      )}

      {/* Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-xs">
        {/* Status and Priority Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <StatusBadge status={task.status} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</p>
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created On</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatDate(task.createdAt)}</p>
          </div>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <div className="flex items-center text-slate-400 text-xs space-x-1">
              <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
              <span>Project</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">{task.projectName}</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <div className="flex items-center text-slate-400 text-xs space-x-1">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assigned To</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {task.assignedTo?.name || 'Unassigned'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <div className="flex items-center text-slate-400 text-xs space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assigned By</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {task.assignedBy?.name || 'System'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <div className="flex items-center text-slate-400 text-xs space-x-1">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span>Due Date</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">{formatDate(task.dueDate)}</p>
          </div>
        </div>

        {/* Task Description */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
            Detailed Description
          </h4>
          <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {task.description || 'No detailed description provided for this task.'}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default TaskDetails;
