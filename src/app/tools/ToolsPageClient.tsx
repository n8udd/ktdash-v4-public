'use client'

import AdminTools from '@/components/tools/AdminTools'
import Resources from '@/components/tools/Resources'
import SettingsForm from '@/components/tools/SettingsForm'
import PageTitle from '@/components/ui/PageTitle'
import clsx from 'clsx'
import { useSession } from 'next-auth/react'
import { useState } from 'react'


export default function ToolsPageClient() {
  const { status, data: session } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }
  
  const [tab, setTab] =
    useState<
    'settings' |
    'resources' |
    'admin'
  >('settings')

  const tabClasses = (selected: boolean) =>
    clsx(
      'px-4 py-2 border-b-2 transition-colors',
      selected
        ? 'border-main text-main'
        : 'border-transparent text-muted hover:text-foreground'
    )
    
  return (
    <div className="px-1 pt-8 max-w-6xl mx-auto">
      <div className="text-center">
        <PageTitle>Tools</PageTitle>

        <div className="w-full">
          <div className="flex justify-center space-x-4 border-b border-border">
            <button className={tabClasses(tab === 'settings')} onClick={() => setTab('settings')}>
              Settings
            </button>
            <button className={tabClasses(tab === 'resources')} onClick={() => setTab('resources')}>
              Resources
            </button>
            {session?.user?.userId == 'vince' && (
              <button className={tabClasses(tab === 'admin')} onClick={() => setTab('admin')}>
                Admin
              </button>
            )}
          </div>
    
          <div className="leading-relaxed overflow-y-auto px-2 text-left">
            <div className={'w-full max-w-md mx-auto ' + (tab === 'settings' ? 'block' : 'hidden')}>
              <SettingsForm />
            </div>
            <div className={'w-full max-w-md mx-auto ' + (tab === 'resources' ? 'block' : 'hidden')}>
              <Resources />
            </div>
            {session?.user?.userId == 'vince' && (
              <div className={'w-full max-w-md mx-auto ' + (tab === 'admin' ? 'block' : 'hidden')}>
                <AdminTools />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}
