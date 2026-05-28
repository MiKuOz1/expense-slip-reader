'use client'
import { useState, useCallback } from 'react'
import { Upload, Loader2, CheckCircle } from 'lucide-react'

export default function SlipUploader({ onSuccess, apiUrl }: { onSuccess: () => void; apiUrl: string }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('slip', file)

    try {
const res = await fetch(`${apiUrl}/api/analyze-slip`, { method: 'POST', body: formData })
  const data = await res.json()
  if (data.success) {
    setResult(data.expense)
    onSuccess()
  } else {
    alert(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    setPreview(null)
  }
} catch (err) {
  console.error(err)
  alert('เชื่อมต่อ server ไม่ได้ กรุณาลองใหม่')
  setPreview(null)
} finally {
  setUploading(false)
}
  }, [onSuccess])

  return (
    <div className="mx-4 md:mx-6 bg-white rounded-2xl border border-[#FFE4EC] p-4">
      <label
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
          dragOver ? 'border-[#F4427A] bg-[#FFF5F8]' : 'border-[#FFB3C6] hover:bg-[#FFF5F8]'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]) }}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {uploading ? (
          <>
            <Loader2 className="animate-spin text-[#F4427A] mb-2" size={32} />
            <p className="text-[#F4427A] font-medium text-sm">AI กำลังอ่านสลิป...</p>
            <p className="text-gray-400 text-xs mt-1">รอสักครู่นะครับ</p>
          </>
        ) : preview ? (
          <img src={preview} className="max-h-40 rounded-lg object-contain" alt="slip preview" />
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0F4] flex items-center justify-center mb-3">
              <Upload className="text-[#F4427A]" size={26} />
            </div>
            <p className="text-gray-700 font-medium text-sm">อัปโหลดสลิปธนาคาร</p>
            <p className="text-gray-400 text-xs mt-1">ลากวางหรือคลิกเพื่อเลือกไฟล์</p>
            <p className="text-gray-300 text-xs mt-0.5">รองรับ JPG, PNG ทุกธนาคาร</p>
          </>
        )}
      </label>

      {result && (
        <div className="mt-3 bg-[#FFF0F4] rounded-xl p-3 flex items-start gap-3 border border-[#FFD6E0]">
          <CheckCircle className="text-[#F4427A] flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-[#D4537E] font-medium text-sm">บันทึกสำเร็จ!</p>
            <p className="text-gray-600 text-xs mt-0.5">
              ฿{result.amount?.toLocaleString()} — {result.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}