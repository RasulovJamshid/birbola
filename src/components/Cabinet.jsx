'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import { getCurrentUser } from '../services/api'

const Cabinet = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    getCurrentUser(token)
      .then(setUser)
      .catch(() => {
        setUser(null)
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#200D37]">
      <Header />
      <main className="container mx-auto px-4 py-8 text-white">
        <h1 className="text-2xl font-bold mb-4">Kabinet</h1>
        {user ? (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Foydalanuvchi ma'lumotlari</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-sm">Ism</p>
                  <p className="text-white font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Rol</p>
                  <p className="text-white font-medium">{user.role}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Foydalanuvchi ID</p>
                  <p className="text-white/70 text-sm font-mono">{user.userId}</p>
                </div>
              </div>
            </div>

            {/* Dashboard Access */}
            {(user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'parent') && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-white">Boshqaruv Paneli</h2>
                    <p className="text-white/60 text-sm">Tizimni boshqarish va kuzatish uchun o'ting</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-6 py-3 bg-[#ff9300] hover:bg-[#ffa31a] text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-[#ff9300]/20"
                  >
                    <LayoutDashboard size={20} />
                    <span>O'tish</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Permissions Card */}
            {user.permissions && user.permissions.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Ruxsatlar</h2>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[#d946ef]/20 text-[#d946ef] rounded-full text-sm font-medium border border-[#d946ef]/30"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tenant Info (if exists) */}
            {user.tenant && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Tashkilot</h2>
                <p className="text-white/70">{user.tenant}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/70">Kabinetdan foydalanish uchun tizimga kiring.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Cabinet
