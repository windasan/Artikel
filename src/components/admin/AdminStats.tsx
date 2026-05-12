'use client'
// src/components/admin/AdminStats.tsx
export function AdminStats({ stats }: { stats: { published:number; pending:number; penulis:number; views:number } }) {
  const items = [
    { icon:'📄', n: stats.published, label:'Artikel Terbit',  trend:'↑ aktif',      color:'text-[var(--sage)]' },
    { icon:'⏳', n: stats.pending,   label:'Pending Review',  trend:'Perlu tindakan',color:'text-amber-500' },
    { icon:'👤', n: stats.penulis,   label:'Penulis Aktif',   trend:'Terdaftar',     color:'text-[var(--sky)]' },
    { icon:'👁️', n: stats.views,    label:'Total Views',      trend:'Semua artikel', color:'text-[var(--coral)]' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map(item => (
        <div key={item.label} className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5">
          <div className="text-2xl mb-3">{item.icon}</div>
          <div className="font-display text-[32px] font-bold text-[var(--ink)] leading-none mb-1">{item.n.toLocaleString()}</div>
          <div className="text-[12px] text-[var(--ink-lt)]">{item.label}</div>
          <div className={`text-[11px] font-semibold mt-2 ${item.color}`}>{item.trend}</div>
        </div>
      ))}
    </div>
  )
}
