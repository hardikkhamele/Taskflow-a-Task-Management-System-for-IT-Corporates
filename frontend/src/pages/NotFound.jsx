import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
        <FileQuestion className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-2 max-w-sm">
        The page or task resource you are looking for does not exist or has been moved.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
