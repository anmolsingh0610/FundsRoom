import React from 'react';

type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    gray: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};
