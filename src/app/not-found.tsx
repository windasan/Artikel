// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[var(--paper)]">
      <div className="text-[80px] mb-4">🏝️</div>
      <h1 className="font-display text-[64px] font-bold text-[var(--ink)] tracking-tight mb-2">404</h1>
      <p className="text-[18px] font-display italic text-[var(--ink-lt)] mb-3">Halaman Tidak Ditemukan</p>
      <p className="text-[14px] text-[var(--ink-lt)] max-w-[380px] mb-8 leading-relaxed">
        Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau belum pernah ada.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="px-5 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors">
          ← Kembali ke Beranda
        </Link>
        <Link href="/artikel" className="px-5 py-2.5 border border-[rgba(28,43,43,0.15)] text-[var(--ink)] text-[13px] font-semibold rounded-xl hover:border-[var(--ink)] transition-colors">
          Telusuri Artikel
        </Link>
      </div>
    </div>
  )
}
