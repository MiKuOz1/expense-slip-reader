import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS })
}

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json(expenses, { headers: CORS_HEADERS })
  } catch {
    return NextResponse.json([], { status: 200, headers: CORS_HEADERS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const expense = await prisma.expense.create({
      data: {
        amount: Number(body.amount) || 0,
        description: body.description || 'รายการใหม่',
        fromBank: body.fromBank || null,
        toBank: body.toBank || null,
        sender: body.sender || null,
        receiver: body.receiver || null,
        date: body.date ? new Date(body.date) : new Date(),
        category: body.category || 'อื่นๆ',
        rawText: '',
      },
    })
    return NextResponse.json({ success: true, expense }, { headers: CORS_HEADERS })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS })
  }
}