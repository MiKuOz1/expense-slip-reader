import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export function generateStaticParams() {
  return []
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'ลบไม่สำเร็จ' }, { status: 500 })
  }
}