import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.usuario.findMany({
      include: {
        cidade: true,
        alertas: true,
        _count: {
          select: {
            alertas: true,
            logs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, nome, email, telefone, cidadeId, aceitaPropaganda } = body

    const hashedPassword = await bcrypt.hash('temp_password', 10)

    const user = await prisma.usuario.create({
      data: {
        id,
        nome,
        email,
        telefone,
        senhaHash: hashedPassword,
        cidadeId,
        aceitaPropaganda: aceitaPropaganda || false
      },
      include: {
        cidade: true
      }
    })

    if (aceitaPropaganda) {
      await prisma.consentimento.create({
        data: {
          usuarioId: user.id,
          meio: 'WhatsApp',
          aceite: true
        }
      })
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
