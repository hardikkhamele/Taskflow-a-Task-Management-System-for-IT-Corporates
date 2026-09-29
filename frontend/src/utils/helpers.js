// Date formatting helpers
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatInputDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check if a task is overdue
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false;
  const due = new Date(dueDate);
  const now = new Date();
  // Strip time for exact date comparison
  due.setHours(23, 59, 59, 999);
  return due < now;
};

// Get Status Badge Color Styling
export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 icon-emerald';
    case 'On Going':
      return 'bg-amber-50 text-amber-700 border-amber-200 icon-amber';
    case 'Pending':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 icon-slate';
  }
};

// Get Priority Badge Color Styling
export const getPriorityBadgeStyle = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
    case 'High':
      return 'bg-orange-50 text-orange-700 border-orange-200 font-medium';
    case 'Medium':
      return 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    case 'Low':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 font-normal';
  }
};
