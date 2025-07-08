'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { WeatherCard } from '@/components/weather/WeatherCard'
import { HourlyForecast } from '@/components/weather/HourlyForecast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Cloud, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sun, 
  Eye, 
  Gauge,
  MapPin,
  RefreshCw,
  Settings,
  Bell,
  History
} from 'lucide-react'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  uvIndex: number
  visibility: number
  description: string
  icon: string
  feelsLike: number
}

interface HourlyForecast {
  time: string
  temperature: number
  precipitation: number
  windSpeed: number
  icon: string
}

interface City {
  id: string
  nome: string
  estado: string
  latitude: number
  longitude: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadCities()
  }, [])

  useEffect(() => {
    if (selectedCity) {
      loadWeatherData()
    }
  }, [selectedCity])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
      return
    }
    setUser(session.user)
  }

  const loadCities = async () => {
    try {
      const response = await fetch('/api/cities')
      if (response.ok) {
        const data = await response.json()
        setCities(data)
        if (data.length > 0) {
          setSelectedCity(data[0])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWeatherData = async () => {
    if (!selectedCity) return
    
    setRefreshing(true)
    try {
      const [currentResponse, hourlyResponse] = await Promise.all([
        fetch(`/api/weather?lat=${selectedCity.latitude}&lon=${selectedCity.longitude}&type=current`),
        fetch(`/api/weather?lat=${selectedCity.latitude}&lon=${selectedCity.longitude}&type=hourly`)
      ])

      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        setWeatherData(currentData)
      }

      if (hourlyResponse.ok) {
        const hourlyData = await hourlyResponse.json()
        setHourlyForecast(hourlyData.slice(0, 12))
      }
    } catch (error) {
      console.error('Erro ao carregar dados meteorológicos:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Cloud className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Meteorológico
            </h1>
            <p className="text-gray-600">
              Bem-vindo, {user?.email}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <span>Seleção de Cidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCity?.id || ''}
                onChange={(e) => {
                  const city = cities.find(c => c.id === e.target.value)
                  setSelectedCity(city || null)
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.nome} - {city.estado}
                  </option>
                ))}
              </select>
              <Button
                onClick={loadWeatherData}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {weatherData && (
          <WeatherCard weatherData={weatherData} />
        )}

        {hourlyForecast.length > 0 && (
          <HourlyForecast forecast={hourlyForecast} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/alerts')}>
            <Card>
              <CardContent className="p-6">
                <Bell className="h-8 w-8 mb-3 text-yellow-500" />
                <h3 className="font-semibold mb-2 text-gray-900">
                  Configurar Alertas
                </h3>
                <p className="text-sm text-gray-600">
                  Configure alertas personalizados para chuva, vento e temperatura
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/history')}>
            <Card>
              <CardContent className="p-6">
                <History className="h-8 w-8 mb-3 text-blue-500" />
                <h3 className="font-semibold mb-2 text-gray-900">
                  Histórico
                </h3>
                <p className="text-sm text-gray-600">
                  Visualize dados históricos dos últimos 30 dias
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin')}>
            <Card>
              <CardContent className="p-6">
                <Settings className="h-8 w-8 mb-3 text-gray-500" />
                <h3 className="font-semibold mb-2 text-gray-900">
                  Administração
                </h3>
                <p className="text-sm text-gray-600">
                  Gerencie usuários, alertas e configurações do sistema
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
