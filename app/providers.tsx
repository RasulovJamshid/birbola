'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '412992329312-dcq9qvo9468t4trl70ga766rfhfg5r4n.apps.googleusercontent.com'}>
      {children}
    </GoogleOAuthProvider>
  )
}
