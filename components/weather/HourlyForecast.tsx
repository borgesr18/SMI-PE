'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface HourlyForecast {
  time: string
  temperature: number
  precipitation: number
  windSpeed: number
  icon: string
}

interface HourlyForecastProps {
  forecast: HourlyForecast[]
  darkMode?: boolean
}

export function HourlyForecast({ forecast, darkMode = false }: HourlyForecastProps) {
  return (
    <Card darkMode={darkMode}>
      <CardHeader darkMode={darkMode}>
        <CardTitle darkMode={darkMode}>Previsão Horária</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {forecast.map((hour, index) => (
              <div key={index} className="flex-shrink-0 text-center min-w-[80px]">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2 font-medium`}>
                  {hour.time}
                </p>
                <img 
                  src={`https://openweathermap.org/img/wn/${hour.icon}.png`}
                  alt="Weather icon"
                  className="w-10 h-10 mx-auto mb-2"
                />
                <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(hour.temperature)}°C
                </p>
                <div className="space-y-1 mt-2">
                  <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
                    💧 {hour.precipitation}mm
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                    💨 {Math.round(hour.windSpeed)} km/h
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
