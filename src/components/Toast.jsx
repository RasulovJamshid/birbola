'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

// Call this anywhere in the app to show a toast:
// showToast('Saqlandi!', 'success')
// showToast('Xatolik yuz berdi', 'error')
// showToast('Ma\'lumot', 'info')
export function showToast(message, type = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
  }
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-[#d946ef]/30 bg-[#d946ef]/10 text-[#d946ef]',
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, ...e.detail }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4000)
    }
    window.addEventListener('show-toast', handler)
    return () => window.removeEventListener('show-toast', handler)
  }, [])

  if (!toasts.length) return null

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Bildirishnomalar"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map(toast => {
        const Icon = icons[toast.type] || icons.info
        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[260px] max-w-sm animate-[reveal-up_0.3s_ease] ${styles[toast.type] || styles.info}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-sm font-semibold text-white flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Yopish"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
