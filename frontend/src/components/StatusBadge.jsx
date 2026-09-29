import React from 'react';
import { getStatusBadgeStyle } from '../utils/helpers';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getIcon = () => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case 'On Going':
        return <PlayCircle className="w-3.5 h-3.5 mr-1" />;
      case 'Pending':
      default:
        return <Clock className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(
        status
      )}`}
    >
      {getIcon()}
      {status || 'Pending'}
    </span>
  );
};

export default StatusBadge;
