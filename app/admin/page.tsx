'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  Bell, 
  FileText,
  Settings,
  Activity,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface User {
  id: string
  nome: string
  email: string
  telefone: string
  cidade: {
    nome: string
    estado: string
  }
  aceitaPropaganda: boolean
  _count: {
    alertas: number
    logs: number
  }
  createdAt: string
}

interface Alert {
  id: string
  tipo: 'CHUVA' | 'VENTO' | 'TEMPERATURA'
  valorGatilho: number
  ativo: boolean
  usuario: {
    nome: string
    email: string
  }
  cidade: {
    nome: string
    estado: string
  }
  createdAt: string
}

interface Log {
  id: string
  tipoMensagem: 'ALERTA' | 'PROPAGANDA'
  conteudo: string
  enviadoComSucesso: boolean
  dataEnvio: string
  usuario: {
    nome: string
    email: string
  }
  alerta?: {
    tipo: string
    valorGatilho: number
  }
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'alerts' | 'logs'>('users')
  const [darkMode, setDarkMode] = useState(false)
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
      const [usersResponse, alertsResponse, logsResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/alerts'),
        fetch('/api/logs')
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData)
      }

      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        setLogs(logsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAlertTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'CHUVA':
        return '🌧️'
      case 'VENTO':
        return '💨'
      case 'TEMPERATURA':
        return '🌡️'
      default:
        return '⚠️'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {users.length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total de Usuários
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {users.filter(u => u.aceitaPropaganda).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Aceitam Propaganda
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className={`h-8 w-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {users.reduce((acc, u) => acc + u._count.alertas, 0)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total de Alertas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card darkMode={darkMode}>
        <CardHeader darkMode={darkMode}>
          <CardTitle darkMode={darkMode}>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nome</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cidade</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Alertas</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Propaganda</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {user.nome}
                      </div>
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.email}
                      </div>
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {user.cidade.nome}, {user.cidade.estado}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="info" darkMode={darkMode}>
                        {user._count.alertas}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={user.aceitaPropaganda ? "success" : "danger"} 
                        darkMode={darkMode}
                      >
                        {user.aceitaPropaganda ? "Sim" : "Não"}
                      </Badge>
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAlertsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {alerts.length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total de Alertas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {alerts.filter(a => a.ativo).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Alertas Ativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {alerts.filter(a => !a.ativo).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Alertas Inativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card darkMode={darkMode}>
        <CardHeader darkMode={darkMode}>
          <CardTitle darkMode={darkMode}>Alertas Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tipo</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Usuário</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cidade</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gatilho</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Criado</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center">
                        <span className="mr-2">{getAlertTypeIcon(alert.tipo)}</span>
                        {alert.tipo}
                      </div>
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {alert.usuario.nome}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {alert.cidade.nome}, {alert.cidade.estado}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {alert.valorGatilho}
                      {alert.tipo === 'CHUVA' && ' mm/h'}
                      {alert.tipo === 'VENTO' && ' km/h'}
                      {alert.tipo === 'TEMPERATURA' && ' °C'}
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={alert.ativo ? "success" : "danger"} 
                        darkMode={darkMode}
                      >
                        {alert.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDate(alert.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLogsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {logs.length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total de Logs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {logs.filter(l => l.enviadoComSucesso).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enviados com Sucesso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card darkMode={darkMode}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {logs.filter(l => !l.enviadoComSucesso).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Falhas no Envio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card darkMode={darkMode}>
        <CardHeader darkMode={darkMode}>
          <CardTitle darkMode={darkMode}>Logs de Envio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tipo</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Usuário</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Conteúdo</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Data</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Badge 
                        variant={log.tipoMensagem === 'ALERTA' ? "warning" : "info"} 
                        darkMode={darkMode}
                      >
                        {log.tipoMensagem}
                      </Badge>
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {log.usuario.nome}
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="max-w-xs truncate">
                        {log.conteudo}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={log.enviadoComSucesso ? "success" : "danger"} 
                        darkMode={darkMode}
                      >
                        {log.enviadoComSucesso ? "Sucesso" : "Falha"}
                      </Badge>
                    </td>
                    <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDate(log.dataEnvio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-900 dark:text-white">
            Carregando dados administrativos...
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Painel Administrativo
          </h1>
          <div className="flex items-center space-x-2">
            <Settings className={`h-6 w-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Administrador: {user?.email}
            </span>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <Button
            variant={activeTab === 'users' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('users')}
            darkMode={darkMode}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </Button>
          <Button
            variant={activeTab === 'alerts' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('alerts')}
            darkMode={darkMode}
            className="flex-1"
          >
            <Bell className="h-4 w-4 mr-2" />
            Alertas
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('logs')}
            darkMode={darkMode}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Logs
          </Button>
        </div>

        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'alerts' && renderAlertsTab()}
        {activeTab === 'logs' && renderLogsTab()}
      </div>
    </DashboardLayout>
  )
}
