'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type ToastType = 'success' | 'error';

interface ToastState {
  id: number;
  type: ToastType;
  message: string;
  isExiting: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast csak ToastProvideren belul hasznalhato.');
  }
  return context;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);
  const idRef = useRef(0);
  const exitDurationMs = 250;

  const showToast = useCallback((message: string, type: ToastType = 'success', durationMs = 5000) => {
    idRef.current += 1;
    const toastId = idRef.current;

    setToast({ id: toastId, type, message, isExiting: false });

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    if (removeTimerRef.current) {
      window.clearTimeout(removeTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      setToast((current) =>
        current?.id === toastId
          ? {
              ...current,
              isExiting: true,
            }
          : current
      );

      removeTimerRef.current = window.setTimeout(() => {
        setToast((current) => (current?.id === toastId ? null : current));
      }, exitDurationMs);
    }, durationMs);
  }, [exitDurationMs]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      if (removeTimerRef.current) {
        window.clearTimeout(removeTimerRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast && (
        <div
          className={`fixed z-[90] top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md md:left-auto md:right-6 md:bottom-6 md:top-auto md:translate-x-0 ${
            toast.isExiting ? 'animate-toast-out' : 'animate-fade-in'
          }`}
        >
          <div
            className={`text-white p-4 rounded-xl shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-green-600 border-green-400/40'
                : 'bg-red-600 border-red-400/40'
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
