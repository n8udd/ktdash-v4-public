'use client'

import { useEffect, useState } from 'react'

export default function AppVersion() {
  const [versionStatus, setVersionStatus] = useState<'loading' | 'active' | 'unsupported'>('loading')
    
  const [version, setVersion] = useState<string>('unknown')
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setVersionStatus('unsupported')
      return
    }
    
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration?.active) {
        setVersionStatus('active')
        fetch('/sw.js')
          .then(response => response.text())
          .then(text => {
            const versionMatch = text.match(/VERSION\s*=\s*['"]([^'"]+)['"]/)
            if (versionMatch) {
              setVersion(versionMatch[1])
            }
          })
      }
    })
  }, [])
    
  return (
    <em className="text-sm text-muted">
      {versionStatus === 'unsupported' && ' (Service Worker not supported)'}
      {versionStatus === 'loading' && ' (checking...)'}
      Version {version}
    </em>
  )
}
