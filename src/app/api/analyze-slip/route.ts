import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function extractSlipData(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const fullText = lines.join(' ')

  // จำนวนเงิน
  const amountPatterns = [
    /(?:จำนวน(?:เงิน)?|ยอด|amount|total)[^\d]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d{1,3}(?:,\d{3})+(?:\.\d{2})?)/,
    /(\d+\.\d{2})/,
  ]
  let amount = 0
  for (const pattern of amountPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''))
      break
    }
  }

  // ธนาคาร
  const bankMap: Record<string, string> = {
    'SCB|ไทยพาณิชย์': 'SCB',
    'กสิกร|KBANK': 'KBANK',
    'กรุงไทย|KTB': 'KTB',
    'กรุงเทพ|BBL': 'BBL',
    'ออมสิน|GSB': 'GSB',
    'ทหารไทย|TTB|TMB': 'TTB',
    'กรุงศรี|BAY': 'BAY',
    'PromptPay|พร้อมเพย์': 'PromptPay',
  }

  let fromBank: string | null = null
  let toBank: string | null = null
  for (const [pattern, bankCode] of Object.entries(bankMap)) {
    if (new RegExp(pattern, 'i').test(fullText)) {
      if (!fromBank) fromBank = bankCode
      else if (!toBank) { toBank = bankCode; break }
    }
  }

  // ผู้โอน
  let sender: string | null = null
  const senderMatch = text.match(
    /จาก[\s\S]{0,30}?((?:นาย|นาง(?:สาว)?|น\.ส\.|น\.ท\.|น\.อ\.)?[\s]*[ก-๙a-zA-Z]{2,}\s+[ก-๙a-zA-Z]{2,})/
  )
  if (senderMatch) sender = senderMatch[1].trim()

  // ผู้รับ
  let receiver: string | null = null
  const receiverMatch = text.match(
    /ไปยัง[\s\S]{0,60}?([ก-๙a-zA-Z][ก-๙a-zA-Z\s\.\,\(\)]{3,})/i
  )
  if (receiverMatch) receiver = receiverMatch[1].trim().split('\n')[0]
  if (!receiver) {
    const companyMatch = fullText.match(/([A-Z][A-Z\s]+CO\.,?\s?LTD\.?(?:\([^)]+\))?)/i)
    if (companyMatch) receiver = companyMatch[1].trim()
  }

  // วันที่
  const thaiMonths: Record<string, string> = {
    'ม\.ค\.|มกราคม': '01', 'ก\.พ\.|กุมภาพันธ์': '02',
    'มี\.ค\.|มีนาคม': '03', 'เม\.ย\.|เมษายน': '04',
    'พ\.ค\.|พฤษภาคม': '05', 'มิ\.ย\.|มิถุนายน': '06',
    'ก\.ค\.|กรกฎาคม': '07', 'ส\.ค\.|สิงหาคม': '08',
    'ก\.ย\.|กันยายน': '09', 'ต\.ค\.|ตุลาคม': '10',
    'พ\.ย\.|พฤศจิกายน': '11', 'ธ\.ค\.|ธันวาคม': '12',
  }

  let date = new Date()
  for (const [pattern, month] of Object.entries(thaiMonths)) {
    const regex = new RegExp(`(\\d{1,2})\\s*(?:${pattern})\\s*(\\d{4})`, 'i')
    const match = text.match(regex)
    if (match) {
      const [, d, y] = match
      const year = parseInt(y) > 2500 ? parseInt(y) - 543 : parseInt(y)
      date = new Date(`${year}-${month}-${d.padStart(2, '0')}`)
      break
    }
  }

  const dateSlash = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (dateSlash && isNaN(date.getTime())) {
    let [, d, m, y] = dateSlash
    if (y.length === 2) y = (parseInt(y) + 2500).toString()
    const year = parseInt(y) > 2500 ? parseInt(y) - 543 : parseInt(y)
    date = new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
  }

  const timeMatch = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (timeMatch && !isNaN(date.getTime())) {
    date.setHours(parseInt(timeMatch[1]))
    date.setMinutes(parseInt(timeMatch[2]))
    date.setSeconds(parseInt(timeMatch[3] || '0'))
  }

  // Category
  let category = 'โอนเงิน'
  if (/อาหาร|food|restaurant|cafe/i.test(fullText)) category = 'อาหาร'
  else if (/grab|taxi|BTS|MRT|น้ำมัน|เดินทาง/i.test(fullText)) category = 'เดินทาง'
  else if (/shopee|lazada|shop|ห้าง|mall/i.test(fullText)) category = 'ช้อปปิ้ง'
  else if (/ค่าน้ำ|ค่าไฟ|bill|บิล|internet|BLUEPAY|บริการ/i.test(fullText)) category = 'บิล'

  const descLine = lines.find(l =>
    /โอน|ชำระ|จ่าย|transfer|payment|BLUEPAY/i.test(l) && l.length < 60
  )
  const description = descLine || (receiver ? `ชำระ ${receiver}` : 'โอนเงิน')

  return { amount, fromBank, toBank, sender, receiver, date, category, description }
}

async function ocrWithEngine(
  base64: string,
  mimeType: string,
  engine: string
): Promise<string> {
  const ocrForm = new FormData()
  ocrForm.append('base64Image', `data:${mimeType};base64,${base64}`)
  ocrForm.append('language', 'tha')
  ocrForm.append('isOverlayRequired', 'false')
  ocrForm.append('OCREngine', engine)
  ocrForm.append('scale', 'true')
  ocrForm.append('isTable', 'true')

  console.log(`Calling OCR Engine ${engine}...`)

  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: process.env.OCR_SPACE_API_KEY! },
    body: ocrForm,
  })

  const data = await res.json()
  console.log(`OCR Engine ${engine} Response:`, JSON.stringify(data)) // 👈 debug
  return data?.ParsedResults?.[0]?.ParsedText || ''
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('slip') as File

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 })
    }

    console.log('File received:', file.name, file.type, file.size)

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    console.log('API Key exists:', !!process.env.OCR_SPACE_API_KEY)

    const [text1, text2] = await Promise.all([
      ocrWithEngine(base64, mimeType, '1'),
      ocrWithEngine(base64, mimeType, '2'),
    ])

    console.log('Engine1:', text1)
    console.log('Engine2:', text2)

    const text = text1.length >= text2.length ? text1 : text2
    console.log('Selected:', text)

    if (!text) {
      return NextResponse.json(
        { error: 'อ่านสลิปไม่ได้ กรุณาลองใหม่' },
        { status: 500 }
      )
    }

    const slipData = extractSlipData(text)
    console.log('Extracted:', slipData)

    const expense = await prisma.expense.create({
      data: {
        amount: slipData.amount,
        description: slipData.description,
        fromBank: slipData.fromBank,
        toBank: slipData.toBank,
        sender: slipData.sender,
        receiver: slipData.receiver,
        date: isNaN(slipData.date.getTime()) ? new Date() : slipData.date,
        category: slipData.category,
        rawText: text,
      },
    })

    return NextResponse.json({ success: true, expense })
  } catch (error: any) {
    console.error('Analyze slip error:', error)
    return NextResponse.json(
      { error: error?.message || 'วิเคราะห์ไม่สำเร็จ กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}