import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')
    const tipoMensagem = searchParams.get('tipoMensagem')

    const whereClause: any = {}
    if (usuarioId) whereClause.usuarioId = usuarioId
    if (tipoMensagem) whereClause.tipoMensagem = tipoMensagem

    const logs = await prisma.logEnvio.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true,
            telefone: true
          }
        },
        alerta: {
          select: {
            tipo: true,
            valorGatilho: true
          }
        }
      },
      orderBy: {
        dataEnvio: 'desc'
      }
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuarioId, alertaId, tipoMensagem, conteudo, enviadoComSucesso } = body

    const log = await prisma.logEnvio.create({
      data: {
        usuarioId,
        alertaId,
        tipoMensagem,
        conteudo,
        enviadoComSucesso
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    )
  }
}
