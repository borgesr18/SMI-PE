import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  darkMode?: boolean
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  darkMode = false,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: darkMode 
      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: darkMode 
      ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500' 
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: darkMode 
      ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500' 
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: darkMode 
      ? 'text-gray-300 hover:bg-gray-700 focus:ring-gray-500' 
      : 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
