'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GoogleLogin } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'
import { RiTelegramFill } from 'react-icons/ri'
import { Instagram, Facebook, Eye, EyeOff, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import { loginWithPassword } from '../services/api'
// Assets now served from public folder
const Logo = '/assets/birbola.svg'

const SignIn = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const [error, setError] = useState('')
  const [telegramData, setTelegramData] = useState(null)
  const [telegramStatus, setTelegramStatus] = useState('idle')
  const intervalRef = useRef(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleAuthSuccess = (response) => {
    // Logic from the working code
    if (response?.access_token) {
      localStorage.setItem('accessToken', response.access_token)
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token)
      }
      // Store as user_token too for compatibility with other parts
      localStorage.setItem('user_token', response.access_token)

      window.dispatchEvent(new Event('auth-change'))
      // Navigate to home
      router.push('/')
    } else {
      throw new Error('No access token received')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await loginWithPassword({
        email: formData.email,
        password: formData.password
      })

      handleAuthSuccess(response)
    } catch (err) {
      console.error('Email sign in failed:', err)
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setSocialLoading('google')
    setError('')

    try {
      // Get the Google ID token
      const googleToken = credentialResponse.credential
      console.log('Got Google Token:', googleToken)

      // Prepare form data for token exchange
      const params = new URLSearchParams()
      params.append('grant_type', 'urn:ietf:params:oauth:grant-type:google_identity_token')
      params.append('assertion', googleToken)
      params.append('scope', 'openid profile email api offline_access')

      // Exchange for Birbola token
      const res = await axios.post('https://auth.birbola.uz/connect/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      handleAuthSuccess(res.data)
    } catch (err) {
      console.error('Google login failed:', err.response?.data || err.message)
      setError(err.response?.data?.error_description || 'Google authentication failed')
    } finally {
      setSocialLoading(null)
    }
  }

  const startTelegramFlow = async () => {
    setSocialLoading('telegram')
    setError('')

    try {
      const currentLang = 'uz' // Can be made dynamic based on user preference
      const res = await axios.post('https://auth.birbola.uz/connect/telegram/start', {
        lang: currentLang
      })

      setTelegramData(res.data)
      setTelegramStatus('waiting')
      setSocialLoading(null)

      // Open Telegram deep link in new window
      window.open(res.data.link, '_blank')
    } catch (err) {
      console.error('Failed to start Telegram flow:', err)
      setError('Could not connect to Telegram server')
      setSocialLoading(null)
    }
  }

  // Poll for Telegram authentication completion
  useEffect(() => {
    if (!telegramData || telegramStatus === 'success') return

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.post(
          'https://auth.birbola.uz/connect/telegram/check',
          JSON.stringify(telegramData.code),
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (res.data.status === 'success' && res.data.exchange_code) {
          clearInterval(intervalRef.current)

          try {
            // Exchange the code for access token
            const params = new URLSearchParams()
            params.append('grant_type', 'urn:ietf:params:oauth:grant-type:one_time_exchange')
            params.append('password', res.data.exchange_code)
            params.append('client_id', 'birbola_web')

            const tokenResponse = await axios.post(
              'https://auth.birbola.uz/connect/token',
              params,
              { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            )

            if (tokenResponse.data.access_token) {
              setTelegramStatus('success')

              setTimeout(() => {
                handleAuthSuccess(tokenResponse.data)
              }, 1000)
            }
          } catch (tokenErr) {
            console.error('Token exchange failed:', tokenErr)
            setError('Telegram authentication failed')
            setTelegramStatus('idle')
          }
        }
      } catch (e) {
        // Ignore polling errors (waiting state)
      }
    }, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [telegramData, telegramStatus, router])

  const handleSocialAuth = async (provider) => {
    setSocialLoading(provider)
    setError('')

    try {
      if (provider === 'telegram') {
        startTelegramFlow()
        return
      }

      if (provider === 'instagram') {
        const clientId = 'YOUR_INSTAGRAM_CLIENT_ID'
        const redirectUri = encodeURIComponent(window.location.origin + '/auth/instagram/callback')
        const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`

        sessionStorage.setItem('authProvider', 'instagram')
        window.location.href = instagramAuthUrl
      } else if (provider === 'facebook') {
        setError('Facebook authentication not yet implemented')
        setSocialLoading(null)
      }
    } catch (err) {
      setError(err.message || `${provider} authentication failed`)
      setSocialLoading(null)
    }
  }


  return (
    <div className="auth-page relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-grid opacity-[0.22]" />
        <div
          className="absolute top-[-100px] right-[-70px] w-[400px] h-[400px] rounded-full opacity-[0.32] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(139, 92, 246, 0.32) 0%, rgba(59, 130, 246, 0.1) 42%, rgba(9, 3, 24, 0) 72%)'
          }}
        />
        <div
          className="absolute left-[-18%] top-[28%] w-[50%] min-w-[280px] aspect-square rounded-full opacity-[0.16] pointer-events-none blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(217, 70, 239, 0.28) 0%, transparent 68%)'
          }}
        />
        <div
          className="absolute left-1/2 bottom-[-140px] -translate-x-1/2 w-[min(120%,900px)] h-[420px] rounded-[50%] opacity-[0.22] pointer-events-none blur-[56px]"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(192, 38, 211, 0.22) 0%, rgba(9, 3, 24, 0) 72%)'
          }}
        />
      </div>

      <header className="relative z-10 auth-header">
        <div className="site-container flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 rounded-xl px-2 py-2 -ml-2 min-h-[44px] text-left transition-colors hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500/60"
            aria-label="Bosh sahifaga qaytish"
          >
            <img src={Logo} alt="" className="h-9 w-auto" width={120} height={36} />
            <span className="hidden sm:inline text-sm font-semibold text-white/65">Bosh sahifa</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 auth-container" id="auth-main">
        <div className="w-full max-w-[400px]">
          <div className="auth-card relative rounded-[2.5rem] p-6 sm:p-8">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-400/75 mb-2">
              Kirish
            </p>
            <h1 className="auth-title text-2xl sm:text-3xl font-black text-white text-center mb-1 tracking-tight">
              Xush kelibsiz
            </h1>
            <p className="auth-subtitle text-white/45 text-center text-sm mb-6 font-medium">
              Hisobingizga kiring
            </p>

            {error && (
              <div
                className="mb-5 rounded-2xl border border-red-500/25 bg-red-500/[0.08] px-3 py-3"
                role="alert"
              >
                <p className="text-center text-sm font-medium text-red-300/95">{error}</p>
              </div>
            )}

            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-white/35">
              Tez kirish
            </p>
            <div className="mb-2 grid grid-cols-2 gap-3 sm:grid-cols-2">
              <div className="auth-social-btn relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {socialLoading === 'google' ? (
                    <Loader2 size={22} className="animate-spin text-white/70" />
                  ) : (
                    <FcGoogle size={24} />
                  )}
                </div>
                <div className="absolute inset-0 opacity-0">
                  <div className="origin-top-left scale-[2] h-[200%] w-[200%]">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google Login Failed')}
                      type="standard"
                      theme="filled_black"
                      size="large"
                      text="signin"
                      shape="rectangular"
                      width="400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSocialAuth('telegram')}
                disabled={socialLoading !== null || telegramStatus === 'waiting'}
                className="auth-social-btn disabled:pointer-events-none"
                aria-label="Telegram orqali kirish"
              >
                {socialLoading === 'telegram' || telegramStatus === 'waiting' ? (
                  <Loader2 size={22} className="animate-spin text-[#0088cc]" />
                ) : (
                  <RiTelegramFill size={24} className="text-[#0088cc]" />
                )}
              </button>
            </div>

            <p className="mb-3 text-center text-[10px] text-white/30">Boshqa tarmoqlar — tez orada</p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                title="Tez orada"
                className="auth-social-btn"
                aria-disabled="true"
                aria-label="Instagram — tez orada"
              >
                <Instagram size={22} className="text-[#E4405F]/55" />
              </button>
              <button
                type="button"
                disabled
                title="Tez orada"
                className="auth-social-btn"
                aria-disabled="true"
                aria-label="Facebook — tez orada"
              >
                <Facebook size={22} className="text-[#1877F2]/55" />
              </button>
            </div>

            {telegramStatus === 'waiting' && (
              <div className="mb-5 rounded-2xl border border-[#0088cc]/25 bg-[#0088cc]/[0.08] px-3 py-3">
                <p className="text-center text-xs font-medium leading-relaxed text-sky-200/95">
                  Telegram oynasida <strong className="font-semibold">Start</strong> va{' '}
                  <strong className="font-semibold">Kontaktni ulashish</strong> tugmalarini bosing.
                </p>
              </div>
            )}

            {telegramStatus === 'success' && (
              <div className="mb-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                <p className="text-center text-xs font-semibold text-emerald-200/95">
                  Muvaffaqiyatli! Yo&apos;naltirilmoqda…
                </p>
              </div>
            )}

            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative bg-[#090318]/90 px-4 text-[10px] font-bold uppercase tracking-widest text-white/25 backdrop-blur-sm">
                yoki
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="relative group">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <div className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-white/25 transition-colors group-focus-within:text-fuchsia-400/90">
                  <Mail size={18} aria-hidden />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email manzilingiz"
                  className="auth-field-input pl-12"
                  required
                />
              </div>

              <div className="relative group">
                <label htmlFor="password" className="sr-only">
                  Parol
                </label>
                <div className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-white/25 transition-colors group-focus-within:text-fuchsia-400/90">
                  <Lock size={18} aria-hidden />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Parolingiz"
                  className="auth-field-input pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-xl text-white/35 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500/60"
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-xs font-bold text-[#d946ef] hover:text-[#c026d3] transition-colors uppercase tracking-wider">
                  Parolni unutdingizmi?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  'Kirish'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-white/35">
              Hisobingiz yo'qmi?{' '}
              <Link
                href="/signup"
                className="font-bold text-white/90 underline-offset-4 transition-colors hover:text-fuchsia-400 hover:underline"
              >
                Ro'yxatdan o'tish
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SignIn
