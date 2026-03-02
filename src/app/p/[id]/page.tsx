import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProfileClient from './ProfileClient'
import type { Metadata } from 'next'

type Contact = { name: string; phone: string; rel?: string }

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await prisma.profile.findUnique({ where: { id: params.id, isActive: true }, select: { name: true, bloodType: true } })
  if (!p) return { title: 'Profile Not Found — SafeScan' }
  return {
    title: `${p.name} — Emergency Profile | SafeScan`,
    description: `Emergency medical profile for ${p.name}. Blood type: ${p.bloodType ?? 'Unknown'}.`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const raw = await prisma.profile.findUnique({
    where: { id: params.id, isActive: true },
    select: {
      id: true, name: true, bloodType: true, age: true, dob: true,
      organDonor: true, allergies: true, medications: true,
      conditions: true, notes: true, contacts: true, insurance: true,
    },
  })

  if (!raw) notFound()

  // Log scan (fire and forget)
  prisma.scanLog.create({ data: { profileId: params.id } }).catch(() => {})
  prisma.profile.update({ where: { id: params.id }, data: { scanCount: { increment: 1 }, lastScanned: new Date() } }).catch(() => {})

  const profile = {
    ...raw,
    contacts: raw.contacts as Contact[],
  }

  return <ProfileClient profile={profile} />
}
