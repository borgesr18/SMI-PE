'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  History,
  Moon
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
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard Meteorológico
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Bem-vindo, {user?.email}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-600'} hover:bg-opacity-80 transition-colors`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => router.push('/alerts')}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'} hover:bg-opacity-80 transition-colors`}
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push('/admin')}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'} hover:bg-opacity-80 transition-colors`}
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* City Selection */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <select
                value={selectedCity?.id || ''}
                onChange={(e) => {
                  const city = cities.find(c => c.id === e.target.value)
                  setSelectedCity(city || null)
                }}
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.nome} - {city.estado}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadWeatherData}
              disabled={refreshing}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors disabled:opacity-50`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Current Weather */}
        {weatherData && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Condições Atuais
              </h2>
              <div className="flex items-center space-x-2">
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                  alt={weatherData.description}
                  className="w-12 h-12"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>
                  {weatherData.description}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Thermometer className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(weatherData.temperature)}°C
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sensação: {Math.round(weatherData.feelsLike)}°C
                </p>
              </div>

              <div className="text-center">
                <Droplets className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {weatherData.humidity}%
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Umidade</p>
              </div>

              <div className="text-center">
                <Wind className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(weatherData.windSpeed)} km/h
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vento</p>
              </div>

              <div className="text-center">
                <Gauge className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(weatherData.pressure)} hPa
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pressão</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <Sun className={`h-6 w-6 mx-auto mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  UV: {weatherData.uvIndex}
                </p>
              </div>
              <div className="text-center">
                <Eye className={`h-6 w-6 mx-auto mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Visibilidade: {Math.round(weatherData.visibility / 1000)} km
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hourly Forecast */}
        {hourlyForecast.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Previsão Horária
            </h2>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-2">
                {hourlyForecast.map((hour, index) => (
                  <div key={index} className="flex-shrink-0 text-center min-w-[80px]">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                      {hour.time}
                    </p>
                    <img 
                      src={`https://openweathermap.org/img/wn/${hour.icon}.png`}
                      alt="Weather icon"
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(hour.temperature)}°C
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {hour.precipitation}mm
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {Math.round(hour.windSpeed)} km/h
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/alerts')}
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-lg p-6 text-left transition-colors`}
          >
            <Bell className={`h-8 w-8 mb-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Configurar Alertas
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Configure alertas personalizados para chuva, vento e temperatura
            </p>
          </button>

          <button
            onClick={() => router.push('/history')}
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-lg p-6 text-left transition-colors`}
          >
            <History className={`h-8 w-8 mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Histórico
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Visualize dados históricos dos últimos 30 dias
            </p>
          </button>

          <button
            onClick={() => router.push('/admin')}
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl shadow-lg p-6 text-left transition-colors`}
          >
            <Settings className={`h-8 w-8 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Administração
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gerencie usuários, alertas e configurações do sistema
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
