import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pernambucoCities = [
  {
    nome: 'Recife',
    estado: 'PE',
    latitude: -8.0476,
    longitude: -34.8770,
    populacaoEstimada: 1653461
  },
  {
    nome: 'Jaboatão dos Guararapes',
    estado: 'PE',
    latitude: -8.1120,
    longitude: -35.0143,
    populacaoEstimada: 706867
  },
  {
    nome: 'Olinda',
    estado: 'PE',
    latitude: -8.0089,
    longitude: -34.8553,
    populacaoEstimada: 393115
  },
  {
    nome: 'Caruaru',
    estado: 'PE',
    latitude: -8.2837,
    longitude: -35.9761,
    populacaoEstimada: 367496
  },
  {
    nome: 'Petrolina',
    estado: 'PE',
    latitude: -9.3891,
    longitude: -40.5030,
    populacaoEstimada: 354317
  },
  {
    nome: 'Paulista',
    estado: 'PE',
    latitude: -7.9407,
    longitude: -34.8728,
    populacaoEstimada: 334376
  },
  {
    nome: 'Cabo de Santo Agostinho',
    estado: 'PE',
    latitude: -8.2115,
    longitude: -35.0348,
    populacaoEstimada: 208931
  },
  {
    nome: 'Camaragibe',
    estado: 'PE',
    latitude: -8.0205,
    longitude: -35.0384,
    populacaoEstimada: 164549
  },
  {
    nome: 'Garanhuns',
    estado: 'PE',
    latitude: -8.8922,
    longitude: -36.4969,
    populacaoEstimada: 140577
  },
  {
    nome: 'Vitória de Santo Antão',
    estado: 'PE',
    latitude: -8.1186,
    longitude: -35.2936,
    populacaoEstimada: 140389
  },
  {
    nome: 'São Lourenço da Mata',
    estado: 'PE',
    latitude: -8.0014,
    longitude: -35.0196,
    populacaoEstimada: 114079
  },
  {
    nome: 'Santa Cruz do Capibaribe',
    estado: 'PE',
    latitude: -7.9569,
    longitude: -36.2036,
    populacaoEstimada: 104307
  },
  {
    nome: 'Abreu e Lima',
    estado: 'PE',
    latitude: -7.9067,
    longitude: -34.8969,
    populacaoEstimada: 99990
  },
  {
    nome: 'Igarassu',
    estado: 'PE',
    latitude: -7.8342,
    longitude: -34.9058,
    populacaoEstimada: 117019
  },
  {
    nome: 'Belo Jardim',
    estado: 'PE',
    latitude: -8.3356,
    longitude: -36.4244,
    populacaoEstimada: 76687
  },
  {
    nome: 'Araripina',
    estado: 'PE',
    latitude: -7.5764,
    longitude: -40.4969,
    populacaoEstimada: 84418
  },
  {
    nome: 'Arcoverde',
    estado: 'PE',
    latitude: -8.4197,
    longitude: -37.0586,
    populacaoEstimada: 76338
  },
  {
    nome: 'Goiana',
    estado: 'PE',
    latitude: -7.5597,
    longitude: -35.0000,
    populacaoEstimada: 81838
  },
  {
    nome: 'Carpina',
    estado: 'PE',
    latitude: -7.8508,
    longitude: -35.2344,
    populacaoEstimada: 81054
  },
  {
    nome: 'Serra Talhada',
    estado: 'PE',
    latitude: -7.9856,
    longitude: -38.2969,
    populacaoEstimada: 85774
  }
]

async function main() {
  console.log('Seeding Pernambuco cities...')
  
  for (const city of pernambucoCities) {
    const existingCity = await prisma.cidade.findFirst({
      where: {
        nome: city.nome,
        estado: city.estado
      }
    })

    if (!existingCity) {
      await prisma.cidade.create({
        data: city
      })
      console.log(`Created city: ${city.nome}`)
    } else {
      console.log(`City already exists: ${city.nome}`)
    }
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
