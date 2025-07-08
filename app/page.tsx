import Link from 'next/link'
import { Cloud, MapPin, Bell, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Cloud className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SMI-PE</h1>
                <p className="text-xs text-gray-500">Sistema Meteorológico</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/alerts" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Alertas
              </Link>
              <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium">
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <CheckCircle className="h-4 w-4 mr-2" />
                Sistema completo para Pernambuco
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Sistema Meteorológico
                <span className="block text-blue-600">Inteligente</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                Monitoramento meteorológico completo para Pernambuco com alertas personalizados via WhatsApp e dados em tempo real
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Ver Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recursos Principais
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tudo que você precisa para monitoramento meteorológico profissional
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: MapPin,
                  title: "Cidades de PE",
                  description: "Cobertura completa das cidades com mais de 50 mil habitantes",
                  color: "blue"
                },
                {
                  icon: Bell,
                  title: "Alertas Personalizados",
                  description: "Configure alertas para chuva, vento e temperatura via WhatsApp",
                  color: "green"
                },
                {
                  icon: BarChart3,
                  title: "Gráficos Detalhados",
                  description: "Visualize dados meteorológicos com gráficos interativos",
                  color: "yellow"
                },
                {
                  icon: Cloud,
                  title: "Dados em Tempo Real",
                  description: "Informações atualizadas de múltiplas fontes meteorológicas",
                  color: "purple"
                }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 h-full">
                    <div className={`inline-flex items-center justify-center p-4 bg-${feature.color}-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
