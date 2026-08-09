import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  noPadding = false,
  ...props
}) => {
  return (
    <div 
      className={`glass-card rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 ${className}`} 
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-800/60">
          {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};
