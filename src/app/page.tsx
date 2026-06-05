'use client'
import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import SlipUploader from '@/components/SlipUploader'
import ExpenseList from '@/components/ExpenseList'

const API = 'https://expense-slip-reader-1w9z.vercel.app'

const categories = ['อาหาร', 'เดินทาง', 'ช้อปปิ้ง', 'บิล', 'โอนเงิน', 'อื่นๆ']

export default function Home() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState('ทั้งหมด')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({
    amount: '', description: '', category: 'อื่นๆ',
    date: new Date().toISOString().slice(0, 10),
    fromBank: '', receiver: '',
  })
  const [saving, setSaving] = useState(false)
  const [detailExpense, setDetailExpense] = useState<any>(null)

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API}/api/expenses`)
      const data = await res.json()
      setExpenses(Array.isArray(data) ? data : [])
    } catch { setExpenses([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchExpenses() }, [])

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    if (detailExpense?.id === id) setDetailExpense(null)
  }

  const handleAddSubmit = async () => {
    if (!form.amount || !form.description) return alert('กรุณากรอกจำนวนเงินและรายละเอียด')
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setExpenses(prev => [data.expense, ...prev])
        setShowAddModal(false)
        setForm({ amount: '', description: '', category: 'อื่นๆ', date: new Date().toISOString().slice(0, 10), fromBank: '', receiver: '' })
      }
    } finally { setSaving(false) }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const todayTotal = expenses
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <main className="min-h-screen bg-[#FFF5F8]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#F4427A] via-[#FF8FAB] to-[#FFB3C6] px-4 md:px-6 pt-10 pb-12">
          <p className="text-white/70 text-sm">สวัสดี 👋</p>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mt-1">รายจ่ายของฉัน</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 flex items-center gap-1.5 text-sm transition-all"
            >
              <Plus size={16} /> เพิ่มเอง
            </button>
          </div>
          <p className="text-white/70 text-sm mt-1">
            {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            {[
              { label: 'วันนี้', value: `฿${todayTotal.toLocaleString('th-TH')}` },
              { label: 'ทั้งหมด', value: `฿${total.toLocaleString('th-TH')}` },
              { label: 'รายการ', value: expenses.length },
            ].map(s => (
              <div key={s.label} className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <p className="font-display font-semibold text-white text-lg">{s.value}</p>
                <p className="text-white/75 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="-mt-5">
          <SlipUploader onSuccess={fetchExpenses} apiUrl={API} />
        </div>

        <div className="mt-5 pb-10">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-[#F4427A] border-t-transparent animate-spin" />
            </div>
          ) : (
            <ExpenseList
              expenses={expenses}
              selected={selected}
              onSelect={setSelected}
              onDelete={handleDelete}
              onClickExpense={setDetailExpense}
            />
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">เพิ่มรายการเอง</h2>
              <button onClick={() => setShowAddModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">จำนวนเงิน *</label>
                <input type="number" placeholder="0.00" value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F4427A]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">รายละเอียด *</label>
                <input type="text" placeholder="เช่น ค่าอาหารกลางวัน" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F4427A]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ประเภท</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F4427A]">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">วันที่</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F4427A]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ธนาคารต้นทาง</label>
                  <input type="text" placeholder="เช่น SCB" value={form.fromBank}
                    onChange={e => setForm(p => ({ ...p, fromBank: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F4427A]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ผู้รับ</label>
                  <input type="text" placeholder="ชื่อผู้รับ" value={form.receiver}
                    onChange={e => setForm(p => ({ ...p, receiver: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F4427A]" />
                </div>
              </div>
            </div>
            <button onClick={handleAddSubmit} disabled={saving}
              className="w-full mt-4 bg-[#F4427A] text-white rounded-xl py-3 font-medium text-sm disabled:opacity-50">
              {saving ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
            </button>
          </div>
        </div>
      )}

      {detailExpense && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">รายละเอียด</h2>
              <button onClick={() => setDetailExpense(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="bg-[#FFF0F4] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[#F4427A]">
                  ฿{detailExpense.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 mt-1">{detailExpense.description}</p>
              </div>
              {[
                { label: 'ประเภท', value: detailExpense.category },
                { label: 'วันที่', value: new Date(detailExpense.date).toLocaleString('th-TH') },
                { label: 'ผู้โอน', value: detailExpense.sender },
                { label: 'ผู้รับ', value: detailExpense.receiver },
                { label: 'ธนาคารต้นทาง', value: detailExpense.fromBank },
                { label: 'ธนาคารปลายทาง', value: detailExpense.toBank },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="text-gray-700 font-medium">{row.value}</span>
                </div>
              ))}
              {detailExpense.rawText && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">ข้อความที่ OCR อ่านได้</p>
                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {detailExpense.rawText}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={async () => {
                if (!confirm('ลบรายการนี้?')) return
                await fetch(`${API}/api/expenses/${detailExpense.id}`, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
})
                handleDelete(detailExpense.id)
              }}
              className="w-full mt-4 border border-red-200 text-red-400 rounded-xl py-2.5 text-sm hover:bg-red-50 transition-colors">
              ลบรายการนี้
            </button>
          </div>
        </div>
      )}
    </main>
  )
}