'use client'

import { useEffect } from 'react'

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Prevent body scroll on this page only
    const originalOverflow = document.body.style.overflow
    const originalHeight = document.body.style.height
    const originalPaddingTop = document.body.style.paddingTop
    
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
    document.body.style.paddingTop = '0'
    
    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.height = originalHeight
      document.body.style.paddingTop = originalPaddingTop
    }
  }, [])

  return <>{children}</>
}
