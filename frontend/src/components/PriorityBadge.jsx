import React from 'react';
import { getPriorityBadgeStyle } from '../utils/helpers';
import { AlertTriangle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const getIcon = () => {
    switch (priority) {
      case 'Critical':
        return <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
      case 'High':
        return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      case 'Medium':
        return <ArrowUp className="w-3.5 h-3.5 mr-1" />;
      case 'Low':
      default:
        return <ArrowDown className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs border ${getPriorityBadgeStyle(
        priority
      )}`}
    >
      {getIcon()}
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
