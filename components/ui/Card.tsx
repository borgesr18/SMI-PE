import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  darkMode?: boolean
}

export function Card({ children, className = '', darkMode = false }: CardProps) {
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  darkMode?: boolean
}

export function CardHeader({ children, className = '', darkMode = false }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${className}`}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  darkMode?: boolean
}

export function CardTitle({ children, className = '', darkMode = false }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} ${className}`}>
      {children}
    </h3>
  )
}
