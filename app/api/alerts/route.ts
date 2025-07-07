import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')

    const whereClause = usuarioId ? { usuarioId } : {}

    const alerts = await prisma.alerta.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true,
            telefone: true
          }
        },
        cidade: {
          select: {
            nome: true,
            estado: true,
            latitude: true,
            longitude: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuarioId, cidadeId, tipo, valorGatilho, horaInicio, horaFim } = body

    const alert = await prisma.alerta.create({
      data: {
        usuarioId,
        cidadeId,
        tipo,
        valorGatilho,
        horaInicio,
        horaFim,
        ativo: true
      },
      include: {
        usuario: {
          select: {
            nome: true,
            email: true,
            telefone: true
          }
        },
        cidade: {
          select: {
            nome: true,
            estado: true,
            latitude: true,
            longitude: true
          }
        }
      }
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const alert = await prisma.alerta.update({
      where: { id },
      data: updateData,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true,
            telefone: true
          }
        },
        cidade: {
          select: {
            nome: true,
            estado: true,
            latitude: true,
            longitude: true
          }
        }
      }
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    await prisma.alerta.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
