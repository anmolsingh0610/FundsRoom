import React from 'react';
import { useToastStore } from '../../stores/toastStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-in-right flex items-start gap-3 p-4 rounded-lg glass-card border-l-4"
          style={{
            borderLeftColor:
              toast.type === 'success' ? '#10b981' :
              toast.type === 'error' ? '#ef4444' : '#3b82f6'
          }}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-100">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
