'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Cloud, 
  LayoutDashboard, 
  Bell, 
  Settings, 
  History, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: any
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Alertas', href: '/alerts', icon: Bell },
    { name: 'Histórico', href: '/history', icon: History },
    { name: 'Administração', href: '/admin', icon: Settings },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col">
          <div className={`flex min-h-0 flex-1 flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="flex h-16 flex-shrink-0 items-center justify-between px-4">
              <div className="flex items-center">
                <Cloud className="h-8 w-8 text-blue-600" />
                <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  SMI-PE
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href)
                      setSidebarOpen(false)
                    }}
                    className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? darkMode
                          ? 'bg-blue-800 text-white'
                          : 'bg-blue-100 text-blue-900'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex min-h-0 flex-1 flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex h-16 flex-shrink-0 items-center px-4">
            <Cloud className="h-8 w-8 text-blue-600" />
            <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              SMI-PE
            </span>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? darkMode
                        ? 'bg-blue-800 text-white'
                        : 'bg-blue-100 text-blue-900'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </button>
              )
            })}
          </nav>
          <div className="flex flex-shrink-0 p-4">
            <div className="flex w-full items-center">
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.email || 'Usuário'}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Sistema Meteorológico
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={`ml-3 flex-shrink-0 rounded-md p-1 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className={`sticky top-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8`}>
          <button
            type="button"
            className={`-m-2.5 p-2.5 lg:hidden ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`-m-2.5 p-2.5 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
