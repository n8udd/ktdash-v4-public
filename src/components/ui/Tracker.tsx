'use client'

import { trackEvent } from '@/lib/utils/trackEvent'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function Tracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return

    const url = pathname + searchParams.toString()

    window.gtag?.('config', 'G-Q584HL6VDV', {
      page_path: url,
    })

    trackEvent('page', 'view')

  }, [pathname])

  return null
}
