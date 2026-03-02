import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const profile = await prisma.profile.findUnique({
    where: { id: params.id, isActive: true },
    select: {
      id: true, name: true, bloodType: true, age: true, dob: true,
      organDonor: true, allergies: true, medications: true,
      conditions: true, notes: true, contacts: true, insurance: true,
    },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Log scan + increment counter (fire and forget)
  const ip      = req.headers.get('x-forwarded-for')?.split(',')[0] ?? null
  const ua      = req.headers.get('user-agent') ?? null
  const country = req.headers.get('x-vercel-ip-country') ?? null

  prisma.scanLog.create({ data: { profileId: params.id, ip, ua, country } }).catch(() => {})
  prisma.profile.update({
    where: { id: params.id },
    data: { scanCount: { increment: 1 }, lastScanned: new Date() },
  }).catch(() => {})

  return NextResponse.json(profile, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.profile.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
