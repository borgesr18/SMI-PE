'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  History, 
  Download, 
  Filter,
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Sun,
  Eye,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface WeatherHistory {
  id: string
  timestamp: string
  temperature: number
  humidity: number
  windSpeed: number
  pressure: number
  uvIndex: number
  visibility: number
  description: string
  icon: string
  feelsLike: number
  cidade: {
    nome: string
    estado: string
    latitude: number
    longitude: number
  }
}

interface City {
  id: string
  nome: string
  estado: string
  latitude: number
  longitude: number
}

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [weatherHistory, setWeatherHistory] = useState<WeatherHistory[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')
  const [selectedCity, setSelectedCity] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadCities()
    generateMockWeatherHistory()
  }, [])

  useEffect(() => {
    if (selectedCity || dateRange) {
      generateMockWeatherHistory()
    }
  }, [selectedCity, dateRange])

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
        const citiesData = await response.json()
        setCities(citiesData)
        if (citiesData.length > 0) {
          setSelectedCity(citiesData[0].id)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cidades:', error)
    }
  }

  const generateMockWeatherHistory = async () => {
    setLoading(true)
    
    try {
      const selectedCityData = cities.find(c => c.id === selectedCity)
      if (!selectedCityData) return

      const days = dateRange === '72h' ? 3 : dateRange === '7d' ? 7 : 30
      const hoursPerDay = dateRange === '72h' ? 24 : 4
      
      const mockData: WeatherHistory[] = []
      const now = new Date()

      for (let day = 0; day < days; day++) {
        for (let hour = 0; hour < hoursPerDay; hour++) {
          const timestamp = new Date(now)
          timestamp.setDate(now.getDate() - day)
          timestamp.setHours(now.getHours() - hour)

          const baseTemp = 25 + Math.sin((day * 24 + hour) / 12) * 5
          const tempVariation = (Math.random() - 0.5) * 4

          mockData.push({
            id: `${day}-${hour}`,
            timestamp: timestamp.toISOString(),
            temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
            humidity: Math.round(60 + Math.random() * 30),
            windSpeed: Math.round(10 + Math.random() * 20),
            pressure: Math.round(1010 + Math.random() * 20),
            uvIndex: Math.max(0, Math.round(Math.random() * 11)),
            visibility: Math.round(8000 + Math.random() * 2000),
            description: ['céu limpo', 'parcialmente nublado', 'nublado', 'chuva leve'][Math.floor(Math.random() * 4)],
            icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)],
            feelsLike: Math.round((baseTemp + tempVariation + (Math.random() - 0.5) * 3) * 10) / 10,
            cidade: selectedCityData
          })
        }
      }

      mockData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setWeatherHistory(mockData)
    } catch (error) {
      console.error('Erro ao gerar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const exportToCSV = () => {
    const headers = [
      'Data/Hora',
      'Cidade',
      'Temperatura (°C)',
      'Sensação Térmica (°C)',
      'Umidade (%)',
      'Velocidade do Vento (km/h)',
      'Pressão (hPa)',
      'Índice UV',
      'Visibilidade (m)',
      'Descrição'
    ]

    const csvContent = [
      headers.join(','),
      ...weatherHistory.map(record => [
        formatDate(record.timestamp),
        `${record.cidade.nome} - ${record.cidade.estado}`,
        record.temperature,
        record.feelsLike,
        record.humidity,
        record.windSpeed,
        record.pressure,
        record.uvIndex,
        record.visibility,
        record.description
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historico_meteorologico_${formatDateShort(new Date().toISOString())}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTemperatureTrend = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-blue-500" />
    }
    return null
  }

  const getAverageData = () => {
    if (weatherHistory.length === 0) return null

    const avgTemp = weatherHistory.reduce((sum, record) => sum + record.temperature, 0) / weatherHistory.length
    const avgHumidity = weatherHistory.reduce((sum, record) => sum + record.humidity, 0) / weatherHistory.length
    const avgWindSpeed = weatherHistory.reduce((sum, record) => sum + record.windSpeed, 0) / weatherHistory.length
    const avgPressure = weatherHistory.reduce((sum, record) => sum + record.pressure, 0) / weatherHistory.length

    return {
      temperature: Math.round(avgTemp * 10) / 10,
      humidity: Math.round(avgHumidity),
      windSpeed: Math.round(avgWindSpeed),
      pressure: Math.round(avgPressure)
    }
  }

  const averageData = getAverageData()

  if (loading) {
    return (
      <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Carregando histórico meteorológico...
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Histórico Meteorológico
          </h1>
          <div className="flex items-center space-x-2">
            <History className={`h-6 w-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {weatherHistory.length} registros
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Período
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="72h">Últimas 72 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>

          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Cidade
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nome}, {city.estado}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={exportToCSV}
              variant="secondary"
              darkMode={darkMode}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {averageData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card darkMode={darkMode}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Thermometer className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                  <div className="ml-4">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {averageData.temperature}°C
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Temp. Média
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card darkMode={darkMode}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Droplets className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <div className="ml-4">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {averageData.humidity}%
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Umidade Média
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card darkMode={darkMode}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Wind className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                  <div className="ml-4">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {averageData.windSpeed}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Vento Médio (km/h)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card darkMode={darkMode}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Gauge className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                  <div className="ml-4">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {averageData.pressure}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Pressão Média (hPa)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card darkMode={darkMode}>
          <CardHeader darkMode={darkMode}>
            <CardTitle darkMode={darkMode}>
              Registros Meteorológicos - {cities.find(c => c.id === selectedCity)?.nome}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Data/Hora</th>
                    <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Temperatura</th>
                    <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Umidade</th>
                    <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Vento</th>
                    <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pressão</th>
                    <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>UV</th>
                    <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {weatherHistory.map((record, index) => {
                    const previousRecord = weatherHistory[index + 1]
                    return (
                      <tr key={record.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatDate(record.timestamp)}
                          </div>
                        </td>
                        <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <Thermometer className="h-4 w-4 mr-2 text-red-500" />
                            {record.temperature}°C
                            {previousRecord && getTemperatureTrend(record.temperature, previousRecord.temperature)}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Sensação: {record.feelsLike}°C
                          </div>
                        </td>
                        <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                            {record.humidity}%
                          </div>
                        </td>
                        <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <Wind className="h-4 w-4 mr-2 text-green-500" />
                            {record.windSpeed} km/h
                          </div>
                        </td>
                        <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <Gauge className="h-4 w-4 mr-2 text-purple-500" />
                            {record.pressure} hPa
                          </div>
                        </td>
                        <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                            {record.uvIndex}
                          </div>
                        </td>
                        <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div className="flex items-center">
                            <img 
                              src={`https://openweathermap.org/img/wn/${record.icon}@2x.png`}
                              alt={record.description}
                              className="w-6 h-6 mr-2"
                            />
                            <span className="capitalize">{record.description}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
