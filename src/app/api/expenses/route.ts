import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
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
    return NextResponse.json({ success: true, expense })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}