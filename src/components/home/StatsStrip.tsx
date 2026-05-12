'use client'
// src/components/home/StatsStrip.tsx

interface Props {
  stats: {
    artikel: number
    penulis: number
    kelompok: number
    kategori: number
  }
}

export function StatsStrip({ stats }: Props) {
  const items = [
    { n: stats.artikel,  label: 'Total Artikel' },
    { n: stats.penulis,  label: 'Penulis Aktif' },
    { n: stats.kelompok, label: 'Kelompok Riset' },
    { n: stats.kategori, label: 'Kategori Topik' },
  ]

  return (
    <div className="bg-white border-t border-b border-[rgba(28,43,43,0.08)] flex justify-center flex-wrap">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex-1 min-w-[140px] max-w-[220px] text-center px-8 py-7 ${
            i < items.length - 1 ? 'border-r border-[rgba(28,43,43,0.07)]' : ''
          }`}
        >
          <div className="font-display text-[40px] font-bold text-[var(--ink)] leading-none mb-1.5 tracking-tight">
            {item.n}
          </div>
          <div className="text-[12px] text-[var(--ink-lt)] font-medium">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
