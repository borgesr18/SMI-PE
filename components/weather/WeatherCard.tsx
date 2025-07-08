'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Sun, 
  Eye 
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

interface WeatherCardProps {
  weatherData: WeatherData
  darkMode?: boolean
}

export function WeatherCard({ weatherData, darkMode = false }: WeatherCardProps) {
  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Baixo', variant: 'success' as const }
    if (uvIndex <= 5) return { level: 'Moderado', variant: 'warning' as const }
    if (uvIndex <= 7) return { level: 'Alto', variant: 'danger' as const }
    if (uvIndex <= 10) return { level: 'Muito Alto', variant: 'danger' as const }
    return { level: 'Extremo', variant: 'danger' as const }
  }

  const uvLevel = getUVLevel(weatherData.uvIndex)

  return (
    <Card darkMode={darkMode}>
      <CardHeader darkMode={darkMode}>
        <div className="flex items-center justify-between">
          <CardTitle darkMode={darkMode}>Condições Atuais</CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <Thermometer className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(weatherData.temperature)}°C
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sensação: {Math.round(weatherData.feelsLike)}°C
            </p>
          </div>

          <div className="text-center">
            <Droplets className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {weatherData.humidity}%
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Umidade</p>
          </div>

          <div className="text-center">
            <Wind className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(weatherData.windSpeed)}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>km/h</p>
          </div>

          <div className="text-center">
            <Gauge className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(weatherData.pressure)}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>hPa</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Índice UV
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {weatherData.uvIndex}
              </span>
              <Badge variant={uvLevel.variant} darkMode={darkMode}>
                {uvLevel.level}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Visibilidade
              </span>
            </div>
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(weatherData.visibility / 1000)} km
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
