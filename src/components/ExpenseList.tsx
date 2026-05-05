'use client'
import ExpenseCard from './ExpenseCard'

const categories = ['ทั้งหมด', 'อาหาร', 'เดินทาง', 'ช้อปปิ้ง', 'บิล', 'โอนเงิน', 'อื่นๆ']

const categoryChip: Record<string, string> = {
  ทั้งหมด:   'bg-[#F4427A] text-white',
  อาหาร:    'bg-[#FFF0F4] text-[#D4537E]',
  เดินทาง:  'bg-[#E6F1FB] text-[#185FA5]',
  ช้อปปิ้ง: 'bg-[#FAEEDA] text-[#BA7517]',
  บิล:      'bg-[#EAF3DE] text-[#3B6D11]',
  โอนเงิน:  'bg-[#EEEDFE] text-[#534AB7]',
  อื่นๆ:    'bg-[#F1EFE8] text-[#5F5E5A]',
}

export default function ExpenseList({
  expenses,
  selected,
  onSelect,
  onDelete,
  onClickExpense,
}: {
  expenses: any[]
  selected: string
  onSelect: (cat: string) => void
  onDelete: (id: string) => void
  onClickExpense: (expense: any) => void
}) {
  const filtered = selected === 'ทั้งหมด'
    ? expenses
    : expenses.filter((e) => e.category === selected)

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-xl transition-all ${
              selected === cat ? categoryChip[cat] : 'bg-white text-gray-400 border border-[#FFE4EC]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-3 px-4 md:px-6">
        <p className="text-xs text-gray-400 font-medium mb-2">รายการล่าสุด</p>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-300">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm">ยังไม่มีรายการ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((e) => (
              <ExpenseCard
                key={e.id}
                expense={e}
                onDelete={onDelete}
                onClick={onClickExpense}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}