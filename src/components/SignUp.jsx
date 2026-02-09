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
    <div className="min-h-screen bg-[#090318] relative overflow-hidden">
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
      <header className="relative z-10 py-4">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center transition-transform hover:scale-105"
          >
            <img src={Logo} alt="Birbola" className="h-8" />
          </button>
        </div>
      </header>

      {/* Auth Container */}
      <div className="relative z-10 flex items-center justify-center px-4 py-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="relative bg-[#0c0528]/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
            {/* Logo */}
            <div className="flex justify-center mb-3">
              {/* <img src={Logo} alt="Birbola" className="h-10" /> */}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white text-center mb-1">
              Hisob yarating
            </h1>
            <p className="text-white/60 text-center text-sm mb-4">
              Birbola oilasiga qo'shiling
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Social Auth Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="relative flex items-center justify-center h-11 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-200 hover:scale-105 overflow-hidden">
                {/* Visual Custom Button */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {socialLoading === 'google' ? <Loader2 size={24} className="animate-spin" /> : <FcGoogle size={24} />}
                </div>

                {/* Actual Clickable Area - Invisible Google Login */}
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
                className="flex items-center justify-center h-11 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign up with Telegram"
              >
                {(socialLoading === 'telegram' || telegramStatus === 'waiting') ? <Loader2 size={24} className="animate-spin text-[#0088cc]" /> : <RiTelegramFill size={24} className="text-[#0088cc]" />}
              </button>

              <button
                onClick={() => handleSocialAuth('instagram')}
                disabled={socialLoading !== null}
                className="flex items-center justify-center h-11 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign up with Instagram"
              >
                {socialLoading === 'instagram' ? <Loader2 size={24} className="animate-spin text-[#E4405F]" /> : <Instagram size={24} className="text-[#E4405F]" />}
              </button>

              <button
                onClick={() => handleSocialAuth('facebook')}
                disabled={socialLoading !== null}
                className="flex items-center justify-center h-11 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign up with Facebook"
              >
                {socialLoading === 'facebook' ? <Loader2 size={24} className="animate-spin text-[#1877F2]" /> : <Facebook size={24} className="text-[#1877F2]" />}
              </button>
            </div>

            {/* Telegram Status Message */}
            {telegramStatus === 'waiting' && (
              <div className="mb-4 p-3 bg-[#0088cc]/10 border border-[#0088cc]/20 rounded-2xl">
                <p className="text-[#0088cc] text-sm text-center">
                  Please click <strong>Start</strong> and <strong>Share Contact</strong> in the Telegram window...
                </p>
              </div>
            )}

            {telegramStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <p className="text-green-400 text-sm text-center font-semibold">
                  ✅ Telegram login successful! Redirecting...
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative bg-[#0c0528] px-4 text-sm text-white/60">
                yoki
              </div>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                  Ism
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <User size={20} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ismingizni kiriting"
                    className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#ff9300] focus:ring-2 focus:ring-[#ff9300]/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <Mail size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#ff9300] focus:ring-2 focus:ring-[#ff9300]/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Parol
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#ff9300] focus:ring-2 focus:ring-[#ff9300]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                  Parolni tasdiqlang
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <Lock size={20} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#ff9300] focus:ring-2 focus:ring-[#ff9300]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-white/60 text-center leading-tight">
                Ro'yxatdan o'tish orqali siz{' '}
                <Link href="/terms" className="text-[#ff9300] hover:text-[#ffa31a] transition-colors">
                  Foydalanish shartlari
                </Link>{' '}
                va{' '}
                <Link href="/privacy" className="text-[#ff9300] hover:text-[#ffa31a] transition-colors">
                  Maxfiylik siyosati
                </Link>{' '}
                bilan rozisiz
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-6 bg-[#ff9300] hover:bg-[#ffa31a] text-white font-semibold rounded-full shadow-lg hover:shadow-[#ff9300]/50 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish"}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-white/60 text-sm mt-3">
              Hisobingiz bormi?{' '}
              <Link href="/signin" className="text-[#ff9300] hover:text-[#ffa31a] font-semibold transition-colors">
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
