'use client'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'

const categoryConfig: Record<string, { emoji: string; bg: string }> = {
  อาหาร:    { emoji: '🍜', bg: 'bg-[#FFF0F4]' },
  เดินทาง:  { emoji: '🚗', bg: 'bg-[#E6F1FB]' },
  ช้อปปิ้ง: { emoji: '🛍️', bg: 'bg-[#FAEEDA]' },
  บิล:      { emoji: '📄', bg: 'bg-[#EAF3DE]' },
  โอนเงิน:  { emoji: '💸', bg: 'bg-[#EEEDFE]' },
  อื่นๆ:    { emoji: '📌', bg: 'bg-[#F1EFE8]' },
}

export default function ExpenseCard({
  expense,
  onDelete,
  onClick,
}: {
  expense: any
  onDelete: (id: string) => void
  onClick: (expense: any) => void
}) {
  const cfg = categoryConfig[expense.category] ?? categoryConfig['อื่นๆ']

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('ลบรายการนี้?')) return
    await fetch(`/api/expenses/${expense.id}`, { method: 'DELETE' })
    onDelete(expense.id)
  }

  return (
    <div
      className="bg-white rounded-2xl p-3 md:p-4 flex items-center gap-3 border border-[#FFE4EC] cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(expense)}
    >
      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${cfg.bg} flex items-center justify-center text-xl flex-shrink-0`}>
        {cfg.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">{expense.description}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {expense.receiver && `${expense.receiver} · `}
          {format(new Date(expense.date), 'd MMM yy', { locale: th })}
        </p>
        <span className="inline-flex items-center gap-1 bg-[#FFF0F4] text-[#D4537E] text-[10px] px-2 py-0.5 rounded-md mt-1">
          ✦ {expense.rawText ? 'AI อ่านสลิป' : 'กรอกเอง'}
        </span>
      </div>

      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
        <p className="font-display font-semibold text-[#F4427A] text-sm">
          -฿{expense.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </p>
        {expense.fromBank && (
          <p className="text-[10px] text-gray-300">{expense.fromBank}</p>
        )}
        <button
          onClick={handleDelete}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}