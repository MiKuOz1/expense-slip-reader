import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'บันทึกรายจ่าย',
  description: 'อัปโหลดสลิปธนาคาร AI อ่านให้อัตโนมัติ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#FFF5F8]">
        {children}
      </body>
    </html>
  )
}