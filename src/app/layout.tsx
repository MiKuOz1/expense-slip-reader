import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'รายจ่ายของฉัน',
  description: 'บันทึกรายจ่ายด้วยการอ่านสลิป',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="รายจ่าย" />
        <meta name="theme-color" content="#F4427A" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}