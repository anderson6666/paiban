import { useEffect } from 'react';
import { useFormatStore } from '@/store/useFormatStore';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function Toast() {
  const toast = useFormatStore((s) => s.toast);
  const setToast = useFormatStore((s) => s.setToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      role="status"
      className="animate-toast-in fixed left-1/2 bottom-10 z-50 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg"
      style={{
        background: isSuccess ? '#0066FF' : '#DC2626',
        color: '#fff',
        transform: 'translateX(-50%)',
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={16} strokeWidth={2.5} />
      ) : (
        <AlertCircle size={16} strokeWidth={2.5} />
      )}
      <span>{toast.message}</span>
      <button
        onClick={() => setToast(null)}
        className="ml-1 opacity-70 hover:opacity-100"
        aria-label="关闭"
      >
        <X size={14} />
      </button>
    </div>
  );
}
