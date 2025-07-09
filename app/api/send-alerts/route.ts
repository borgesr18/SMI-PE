// app/api/send-alerts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AlertaTipo, MensagemTipo } from '@prisma/client'
import { getPrevisao } from '@/lib/weatherService'
import { enviarMensagemWhatsApp } from '@/lib/twilio'

export async function POST() {
  try {
    const horaAtual = new Date().getHours()

    const usuarios = await prisma.usuario.findMany({
      where: {
        aceitaPropaganda: true,
      },
      include: {
        cidade: true,
      },
    })

    for (const usuario of usuarios) {
      const { cidade } = usuario
      const previsao = await getPrevisao(cidade.latitude, cidade.longitude)

      const mensagem = `Bom dia, ${usuario.nome}! ☀️\n\n📍 *${cidade.nome} - ${cidade.estado}*\n🌡️ Temperatura: ${previsao.temperatura}°C\n☁️ Condição: ${previsao.descricao}\n🌧️ Chance de chuva: ${previsao.chuva}%\n\n💬 *Patrocínio:*\nExperimente já o novo serviço do SMI-PE com alertas personalizados. Responda com "QUERO" e receba as novidades!`

      const enviado = await enviarMensagemWhatsApp(usuario.telefone, mensagem)

      await prisma.logEnvio.create({
        data: {
          usuarioId: usuario.id,
          tipoMensagem: MensagemTipo.PROPAGANDA,
          conteudo: mensagem,
          enviadoComSucesso: !!enviado?.sid,
        },
      })
    }

    const alertas = await prisma.alerta.findMany({
      where: {
        ativo: true,
      },
      include: {
        usuario: {
          select: {
            nome: true,
            telefone: true,
            aceitaPropaganda: true,
          },
        },
        cidade: true,
      },
    })

    for (const alerta of alertas) {
      if (horaAtual < alerta.horaInicio || horaAtual > alerta.horaFim) continue

      const previsao = await getPrevisao(alerta.cidade.latitude, alerta.cidade.longitude)
      const { chuva, temperatura, descricao } = previsao

      let disparar = false
      if (alerta.tipo === AlertaTipo.CHUVA && chuva >= alerta.valorGatilho) disparar = true
      if (alerta.tipo === AlertaTipo.TEMPERATURA && temperatura >= alerta.valorGatilho) disparar = true
      if (alerta.tipo === AlertaTipo.VENTO) {
        // TODO: implementar lógica de vento
      }

      if (disparar) {
        const mensagem = `⚠️ Alerta de ${alerta.tipo.toLowerCase()}!\n\n📍 *${alerta.cidade.nome} - ${alerta.cidade.estado}*\n🔎 ${descricao}\n🌡️ Temperatura: ${temperatura}°C\n🌧️ Chuva: ${chuva}%\n\n🔔 SMI-PE - Monitoramento Inteligente.`

        const enviado = await enviarMensagemWhatsApp(alerta.usuario.telefone, mensagem)

        await prisma.logEnvio.create({
          data: {
            usuarioId: alerta.usuarioId,
            alertaId: alerta.id,
            tipoMensagem: MensagemTipo.ALERTA,
            conteudo: mensagem,
            enviadoComSucesso: !!enviado?.sid,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar alertas:', error)
    return NextResponse.json({ error: 'Erro interno ao enviar alertas.' }, { status: 500 })
  }
}

