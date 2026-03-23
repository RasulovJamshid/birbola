'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GoogleLogin } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'
import { RiTelegramFill } from 'react-icons/ri'
import { Instagram, Facebook, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react'
import axios from 'axios'
import { registerParent, loginWithPassword } from '../services/api'
// Assets now served from public folder
const Logo = '/assets/birbola.svg'

const SignUp = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const [error, setError] = useState('')
  const [telegramData, setTelegramData] = useState(null)
  const [telegramStatus, setTelegramStatus] = useState('idle')
  const intervalRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleAuthSuccess = (response) => {
    // Logic from the working code
    if (response?.access_token) {
      localStorage.setItem('accessToken', response.access_token)
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token)
      }
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

    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmaydi!')
      setLoading(false)
      return
    }

    try {
      await registerParent({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      const loginResponse = await loginWithPassword({
        email: formData.email,
        password: formData.password
      })

      handleAuthSuccess(loginResponse)
    } catch (err) {
      console.error('Sign up failed:', err)
      setError(err.message || 'Sign up failed')
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
      const currentLang = 'uz'
      const res = await axios.post('https://auth.birbola.uz/connect/telegram/start', {
        lang: currentLang
      })

      setTelegramData(res.data)
      setTelegramStatus('waiting')
      setSocialLoading(null)

      window.open(res.data.link, '_blank')
    } catch (err) {
      console.error('Failed to start Telegram flow:', err)
      setError('Could not connect to Telegram server')
      setSocialLoading(null)
    }
  }

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
        // Ignore polling errors
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
        // Instagram OAuth flow
        const clientId = 'YOUR_INSTAGRAM_CLIENT_ID'
        const redirectUri = encodeURIComponent(window.location.origin + '/auth/instagram/callback')
        const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`

        // Store that we're doing Instagram auth
        sessionStorage.setItem('authProvider', 'instagram')
        window.location.href = instagramAuthUrl
      } else if (provider === 'telegram') {
        // Telegram Web Login Widget integration
        if (window.Telegram?.Login) {
          window.Telegram.Login.auth(
            { bot_id: 'YOUR_BOT_ID', request_access: true },
            async (data) => {
              if (data) {
                try {
                  response = await authWithTelegram({
                    ...data,
                    tenantId: 0
                  })
                  handleAuthSuccess(response)
                } catch (err) {
                  setError(err.message || 'Telegram authentication failed')
                } finally {
                  setSocialLoading(null)
                }
              }
            }
          )
        } else {
          throw new Error('Telegram Login not initialized')
        }
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
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Purple Grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Top-right Orange Glow */}
        <div className="absolute top-[-120px] right-[-80px] w-[460px] h-[460px] rounded-full opacity-80 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 166, 0, 0.65) 0%, rgba(255, 166, 0, 0) 65%)'
          }}
        />

        {/* Bottom Pink Glow */}
        <div className="absolute left-1/2 bottom-[-150px] -translate-x-1/2 w-[120%] h-[500px] rounded-t-full opacity-95 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255, 7, 222, 0.45) 0%, rgba(32, 13, 55, 0) 75%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* Simple Header with Logo */}
      <header className="relative z-10 py-6 auth-header">
        <div className="site-container">
          <button
            onClick={() => router.push('/')}
            className="flex items-center transition-transform hover:scale-105"
          >
            <img src={Logo} alt="Birbola" className="h-9" />
          </button>
        </div>
      </header>

      {/* Auth Container */}
      <div className="relative z-10 px-4 auth-container">
        <div className="w-full max-w-[420px]">
          {/* Auth Card */}
          <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl auth-card">
            {/* Title */}
            <h1 className="text-3xl font-black text-white text-center mb-1 tracking-tight auth-title">
              Hisob yarating
            </h1>
            <p className="text-white/40 text-center text-sm mb-6 font-medium auth-subtitle">
              Birbola oilasiga qo'shiling
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            {/* Social Auth Buttons */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="relative flex items-center justify-center h-11 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 overflow-hidden">
                {/* Visual Custom Button */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {socialLoading === 'google' ? <Loader2 size={18} className="animate-spin" /> : <FcGoogle size={20} />}
                </div>
                {/* actual clickable area */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 overflow-hidden">
                  <div className="scale-[2.0] origin-top-left w-[200%] h-[200%]">
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
                onClick={() => handleSocialAuth('telegram')}
                disabled={socialLoading !== null || telegramStatus === 'waiting'}
                className="flex items-center justify-center h-11 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                aria-label="Sign up with Telegram"
              >
                {(socialLoading === 'telegram' || telegramStatus === 'waiting') ? <Loader2 size={18} className="animate-spin text-[#0088cc]" /> : <RiTelegramFill size={20} className="text-[#0088cc]" />}
              </button>

              <button
                onClick={() => handleSocialAuth('instagram')}
                disabled={socialLoading !== null}
                className="flex items-center justify-center h-11 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                aria-label="Sign up with Instagram"
              >
                {socialLoading === 'instagram' ? <Loader2 size={18} className="animate-spin text-[#E4405F]" /> : <Instagram size={20} className="text-[#E4405F]" />}
              </button>

              <button
                onClick={() => handleSocialAuth('facebook')}
                disabled={socialLoading !== null}
                className="flex items-center justify-center h-11 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                aria-label="Sign up with Facebook"
              >
                {socialLoading === 'facebook' ? <Loader2 size={18} className="animate-spin text-[#1877F2]" /> : <Facebook size={20} className="text-[#1877F2]" />}
              </button>
            </div>

            {/* Telegram Status Message */}
            {telegramStatus === 'waiting' && (
              <div className="mb-4 p-3 bg-[#0088cc]/10 border border-[#0088cc]/20 rounded-2xl">
                <p className="text-[#0088cc] text-[11px] text-center font-medium">
                  Iltimos, Telegram oynasida <strong>Start</strong> va <strong>Kontaktni ulashish</strong> tugmalarini bosing...
                </p>
              </div>
            )}

            {telegramStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <p className="text-green-400 text-xs text-center font-bold">
                  ✅ Muvaffaqiyatli kirdingiz! Yo'naltirilmoqda...
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative bg-[#090318] px-4 text-[10px] uppercase tracking-widest font-bold text-white/20">
                yoki
              </div>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#d946ef] transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ismingiz"
                    className="w-full pl-12 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#d946ef] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email manzilingiz"
                    className="w-full pl-12 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#d946ef] transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Parol"
                    className="w-full pl-12 pr-10 py-2.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all text-sm font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#d946ef] transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Tasdiqlash"
                    className="w-full pl-12 pr-10 py-2.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all text-sm font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-white/30 text-center leading-relaxed py-2">
                Ro'yxatdan o'tish orqali siz{' '}
                <Link href="/terms" className="text-[#d946ef] hover:underline">Foydalanish shartlari</Link> va <Link href="/privacy" className="text-[#d946ef] hover:underline">Maxfiylik siyosati</Link> bilan rozisiz
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
                  "Ro'yxatdan o'tish"
                )}
              </button>
            </form>

            <p className="text-center text-white/30 text-sm mt-6 font-medium">
              Hisobingiz bormi?{' '}
              <Link href="/signin" className="text-white hover:text-[#d946ef] font-bold transition-colors">
                Kirish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
