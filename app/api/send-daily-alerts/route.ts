// app/api/send-daily-alerts/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AlertaTipo, MensagemTipo } from '@prisma/client'
import { getPrevisao } from '@/lib/weatherService'
import { enviarMensagemWhatsApp } from '@/lib/twilio'

export async function POST() {
  try {
    const horaAtual = new Date().getHours()

    // 1. Mensagens diárias para todos os usuários
    const usuarios = await prisma.usuario.findMany({
      where: {
        aceitaPropaganda: true,
        telefone: { not: '' },
        cidadeId: { not: null },
      },
      include: {
        cidade: true,
      },
    })

    for (const usuario of usuarios) {
      const { cidade } = usuario
      if (!cidade || !usuario.telefone) continue

      const previsao = await getPrevisao(cidade.latitude, cidade.longitude)

      const mensagem = `Bom dia, ${usuario.nome}! ☀️

📍 *${cidade.nome} - ${cidade.estado}*
🌡️ Temperatura: ${previsao.temperatura}°C
☁️ Condição: ${previsao.descricao}
🌧️ Chance de chuva: ${previsao.chuva}%

💬 *Patrocínio:*
Experimente já o novo serviço do SMI-PE com alertas personalizados. Responda com "QUERO" e receba as novidades!`

      const enviado = await enviarMensagemWhatsApp(usuario.telefone, mensagem).then(() => true).catch(() => false)

      await prisma.logEnvio.create({
        data: {
          usuarioId: usuario.id,
          tipoMensagem: MensagemTipo.PROPAGANDA,
          conteudo: mensagem,
          enviadoComSucesso: enviado,
        },
      })
    }

    // 2. Disparo de alertas ativos se horário for compatível
    const alertas = await prisma.alerta.findMany({
      where: {
        ativo: true,
        usuario: {
          telefone: { not: '' },
        },
      },
      include: {
        usuario: true,
        cidade: true,
      },
    })

    for (const alerta of alertas) {
      if (!alerta.cidade || !alerta.usuario?.telefone) continue
      if (horaAtual < alerta.horaInicio || horaAtual > alerta.horaFim) continue

      const previsao = await getPrevisao(alerta.cidade.latitude, alerta.cidade.longitude)
      const { chuva, temperatura, descricao } = previsao

      let disparar = false
      if (alerta.tipo === AlertaTipo.CHUVA && chuva >= alerta.valorGatilho) disparar = true
      if (alerta.tipo === AlertaTipo.TEMPERATURA && temperatura >= alerta.valorGatilho) disparar = true
      if (alerta.tipo === AlertaTipo.VENTO) {
        // lógica para vento, se for implementado
      }

      if (disparar) {
        const mensagem = `⚠️ Alerta de ${alerta.tipo.toLowerCase()}!

📍 *${alerta.cidade.nome} - ${alerta.cidade.estado}*
🔎 ${descricao}
🌡️ Temperatura: ${temperatura}°C
🌧️ Chuva: ${chuva}%

🔔 SMI-PE - Monitoramento Inteligente.`

        const enviado = await enviarMensagemWhatsApp(alerta.usuario.telefone, mensagem).then(() => true).catch(() => false)

        await prisma.logEnvio.create({
          data: {
            usuarioId: alerta.usuarioId,
            alertaId: alerta.id,
            tipoMensagem: MensagemTipo.ALERTA,
            conteudo: mensagem,
            enviadoComSucesso: enviado,
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

