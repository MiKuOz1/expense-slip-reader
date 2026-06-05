import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS })
}

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
    return NextResponse.json({ success: true }, { headers: CORS_HEADERS })
  } catch {
    return NextResponse.json({ error: 'ลบไม่สำเร็จ' }, { status: 500, headers: CORS_HEADERS })
  }
}