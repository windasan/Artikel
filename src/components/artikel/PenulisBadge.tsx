// src/components/artikel/PenulisBadge.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Route } from 'next'

interface PenulisItem {
  id: string
  nama: string | null
  nim: string | null
  foto_url: string | null
  urutan?: number
}

export function PenulisBadge({ penulis }: { penulis: PenulisItem }) {
  return (
    <Link
      href={`/penulis/${penulis.id}` as Route}
      className="flex items-center gap-3 hover:opacity-75 transition-opacity group"
    >
      {penulis.foto_url ? (
        <Image
          src={penulis.foto_url}
          alt={penulis.nama ?? ''}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[var(--coral)] transition-all"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[var(--coral)] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 ring-2 ring-transparent group-hover:ring-[var(--coral)] transition-all">
          {(penulis.nama ?? 'U').slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-[14px] font-semibold text-[var(--ink)] group-hover:text-[var(--coral)] transition-colors">
          {penulis.nama ?? '—'}
        </p>
        {penulis.nim && (
          <p className="text-[11px] text-[var(--ink-lt)]">{penulis.nim}</p>
        )}
      </div>
    </Link>
  )
}
