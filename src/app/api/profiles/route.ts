import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, bloodType, age, dob, insurance, organDonor,
            allergies, medications, conditions, notes, contacts } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!contacts?.length) {
      return NextResponse.json({ error: 'At least one contact required' }, { status: 400 })
    }

    const profile = await prisma.profile.create({
      data: {
        id:          uuid(),
        name:        name.trim(),
        bloodType:   bloodType || null,
        age:         age !== undefined && age !== null ? parseInt(String(age)) : null,
        dob:         dob || null,
        insurance:   insurance || null,
        organDonor:  Boolean(organDonor),
        allergies:   Array.isArray(allergies)   ? allergies   : [],
        medications: Array.isArray(medications) ? medications : [],
        conditions:  conditions || null,
        notes:       notes || null,
        contacts:    Array.isArray(contacts)    ? contacts    : [],
      },
    })

    return NextResponse.json({ success: true, id: profile.id }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page  = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = 20
  const search = searchParams.get('q') ?? ''

  const where = search
    ? { OR: [
        { name:       { contains: search, mode: 'insensitive' as const } },
        { conditions: { contains: search, mode: 'insensitive' as const } },
      ]}
    : {}

  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, bloodType: true, age: true,
        organDonor: true, allergies: true, isActive: true,
        scanCount: true, createdAt: true, contacts: true,
      },
    }),
    prisma.profile.count({ where }),
  ])

  return NextResponse.json({ profiles, total, page, pages: Math.ceil(total / limit) })
}
