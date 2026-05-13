'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#090318] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <Image src="/assets/birbola.svg" alt="Birbola" width={120} height={40} className="mb-10 opacity-80" />

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Xatolik yuz berdi</h1>
        <p className="text-white/40 mb-10 leading-relaxed">
          Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko&apos;ring.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button onClick={reset} className="btn-primary">
            Qayta urinish
          </button>
          <Link href="/" className="btn-secondary">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  )
}
