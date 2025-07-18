'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Clock,
  MapPin,
  ToggleLeft
} from 'lucide-react'

interface Alert {
  id: string
  tipo: 'CHUVA' | 'VENTO' | 'TEMPERATURA'
  valorGatilho: number
  horaInicio: number
  horaFim: number
  ativo: boolean
  cidade: {
    nome: string
    estado: string
  }
  createdAt: string
}

interface City {
  id: string
  nome: string
  estado: string
}

export default function AlertsPage() {
  const [user, setUser] = useState<any>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [formData, setFormData] = useState({
    tipo: 'CHUVA' as 'CHUVA' | 'VENTO' | 'TEMPERATURA',
    valorGatilho: 10,
    horaInicio: 6,
    horaFim: 21,
    cidadeId: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
      return
    }
    setUser(session.user)
  }

  const loadData = async () => {
    try {
      const [alertsResponse, citiesResponse] = await Promise.all([
        fetch('/api/alerts'),
        fetch('/api/cities')
      ])

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData)
      }

      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json()
        setCities(citiesData)
        if (citiesData.length > 0 && !formData.cidadeId) {
          setFormData(prev => ({ ...prev, cidadeId: citiesData[0].id }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingAlert ? 'PUT' : 'POST'
      const body = editingAlert 
        ? { id: editingAlert.id, ...formData }
        : { ...formData, usuarioId: user.id }

      const response = await fetch('/api/alerts', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        await loadData()
        setShowForm(false)
        setEditingAlert(null)
        setFormData({
          tipo: 'CHUVA',
          valorGatilho: 10,
          horaInicio: 6,
          horaFim: 21,
          cidadeId: cities[0]?.id || ''
        })
      }
    } catch (error) {
      console.error('Erro ao salvar alerta:', error)
    }
  }

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert)
    setFormData({
      tipo: alert.tipo,
      valorGatilho: alert.valorGatilho,
      horaInicio: alert.horaInicio,
      horaFim: alert.horaFim,
      cidadeId: '' // Will need to get this from the alert
    })
    setShowForm(true)
  }

  const handleDelete = async (alertId: string) => {
    if (!confirm('Tem certeza que deseja excluir este alerta?')) return

    try {
      const response = await fetch(`/api/alerts?id=${alertId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error('Erro ao excluir alerta:', error)
    }
  }

  const toggleAlert = async (alert: Alert) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: alert.id,
          ativo: !alert.ativo
        }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error('Erro ao alterar status do alerta:', error)
    }
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'CHUVA':
        return <Droplets className="h-5 w-5 text-blue-500" />
      case 'VENTO':
        return <Wind className="h-5 w-5 text-green-500" />
      case 'TEMPERATURA':
        return <Thermometer className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getAlertUnit = (tipo: string) => {
    switch (tipo) {
      case 'CHUVA':
        return 'mm/h'
      case 'VENTO':
        return 'km/h'
      case 'TEMPERATURA':
        return '°C'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Cloud className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Carregando alertas...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configuração de Alertas
            </h1>
            <p className="text-gray-600">
              Configure alertas personalizados para condições meteorológicas
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Alerta</span>
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingAlert ? 'Editar Alerta' : 'Novo Alerta'}
              </CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Alerta
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tipo: e.target.value as 'CHUVA' | 'VENTO' | 'TEMPERATURA'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CHUVA">Chuva</option>
                    <option value="VENTO">Vento</option>
                    <option value="TEMPERATURA">Temperatura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <select
                    value={formData.cidadeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, cidadeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.nome} - {city.estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Gatilho ({getAlertUnit(formData.tipo)})
                  </label>
                  <input
                    type="number"
                    value={formData.valorGatilho}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      valorGatilho: parseFloat(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Funcionamento
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={formData.horaInicio}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        horaInicio: parseInt(e.target.value) 
                      }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="23"
                      required
                    />
                    <span className="text-gray-500">às</span>
                    <input
                      type="number"
                      value={formData.horaFim}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        horaFim: parseInt(e.target.value) 
                      }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="23"
                      required
                    />
                    <span className="text-gray-500">horas</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingAlert(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAlert ? 'Atualizar' : 'Criar'} Alerta
                </Button>
              </div>
            </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum alerta configurado
                </h3>
                <p className="text-gray-600 mb-4">
                  Configure seu primeiro alerta para receber notificações sobre condições meteorológicas
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Criar Primeiro Alerta
                </Button>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getAlertIcon(alert.tipo)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Alerta de {alert.tipo.toLowerCase()}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{alert.cidade.nome} - {alert.cidade.estado}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{alert.horaInicio}h às {alert.horaFim}h</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {alert.valorGatilho} {getAlertUnit(alert.tipo)}
                        </p>
                        <Badge variant={alert.ativo ? 'success' : 'danger'}>
                          {alert.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAlert(alert)}
                        >
                          <ToggleLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(alert)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
