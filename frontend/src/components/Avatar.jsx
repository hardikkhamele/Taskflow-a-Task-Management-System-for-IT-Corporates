import React, { useState } from 'react';

const Avatar = ({ src, name = 'User', className = 'w-10 h-10', textClassName = 'text-xs' }) => {
  const [error, setError] = useState(false);

  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  if (!src || error) {
    return (
      <div
        className={`${className} rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0 select-none`}
      >
        <span className={textClassName}>{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className={`${className} rounded-full object-cover border border-slate-200 shadow-xs shrink-0`}
    />
  );
};

export default Avatar;
