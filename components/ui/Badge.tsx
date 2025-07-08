import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
  darkMode?: boolean
}

export function Badge({ children, variant = 'default', className = '', darkMode = false }: BadgeProps) {
  const variants = {
    default: darkMode 
      ? 'bg-gray-700 text-gray-300' 
      : 'bg-gray-100 text-gray-800',
    success: darkMode 
      ? 'bg-green-800 text-green-200' 
      : 'bg-green-100 text-green-800',
    warning: darkMode 
      ? 'bg-yellow-800 text-yellow-200' 
      : 'bg-yellow-100 text-yellow-800',
    danger: darkMode 
      ? 'bg-red-800 text-red-200' 
      : 'bg-red-100 text-red-800',
    info: darkMode 
      ? 'bg-blue-800 text-blue-200' 
      : 'bg-blue-100 text-blue-800'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
