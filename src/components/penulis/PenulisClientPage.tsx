'use client'
// src/components/penulis/PenulisClientPage.tsx
import { useState } from 'react'
import type { Profile, Kelompok } from '@/types/database'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'

interface Props { penulisList: Profile[]; kelompokList: Kelompok[] }

const ROLE_STYLE: Record<string,string> = {
  penulis:    'bg-[var(--sage-lt)] text-[#3D7050]',
  editor:     'bg-[var(--sky-lt)] text-[#2A7090]',
  reviewer:   'bg-[var(--coral-lt)] text-[#C05030]',
  koordinator:'bg-[var(--gold-lt)] text-[#8A6010]',
  admin:      'bg-[rgba(28,43,43,0.08)] text-[var(--ink)]',
}

export function PenulisClientPage({ penulisList, kelompokList }: Props) {
  const [tab, setTab]       = useState<'penulis'|'kelompok'>('penulis')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const filteredPenulis = penulisList.filter(p => {
    const matchSearch = !search ||
      p.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
      p.nim?.includes(search)
    const matchRole = !roleFilter || p.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-[rgba(28,43,43,0.08)] mt-2">
        {([['penulis','👤 Daftar Penulis'],['kelompok','👥 Daftar Kelompok']] as [string,string][]).map(([key,label]) => (
          <button key={key} onClick={() => setTab(key as 'penulis'|'kelompok')}
            className={`px-6 py-3.5 text-[14px] font-medium border-b-2 transition-colors -mb-px ${
              tab === key ? 'border-[var(--coral)] text-[var(--ink)] font-semibold' : 'border-transparent text-[var(--ink-lt)] hover:text-[var(--ink)]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── PENULIS TAB ── */}
      {tab === 'penulis' && (
        <div className="py-6">
          <div className="flex gap-3 mb-5 flex-wrap">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau NIM..."
              className="border border-[rgba(28,43,43,0.12)] rounded-xl px-4 py-2 text-[13px] outline-none focus:border-[var(--coral)] max-w-[260px] w-full" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="border border-[rgba(28,43,43,0.12)] rounded-xl px-3.5 py-2 text-[13px] bg-white outline-none cursor-pointer focus:border-[var(--coral)]">
              <option value="">Semua Role</option>
              {['penulis','editor','reviewer','koordinator'].map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[rgba(28,43,43,0.025)]">
                  {['#','Penulis','NIM','Email','No. HP','Role','Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPenulis.map((p, i) => (
                  <tr key={p.id} className="border-t border-[rgba(28,43,43,0.06)] hover:bg-[rgba(28,43,43,0.015)]">
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink-lt)]">{i+1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.foto_url ? (
                          <Image src={p.foto_url} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[var(--coral)] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">
                            {(p.nama_lengkap ?? 'U').slice(0,2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--ink)]">{p.nama_lengkap ?? '—'}</p>
                          <p className="text-[11px] text-[var(--ink-lt)]">{p.nim}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink-lt)]">{p.nim ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink-lt)]">{p.email}</td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--ink-lt)]">{p.no_telepon ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ROLE_STYLE[p.role] ?? ROLE_STYLE.penulis}`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/penulis/${p.id}` as Route}
                        className="text-[12px] font-semibold text-[var(--coral)] hover:underline">
                        Lihat →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPenulis.length === 0 && (
              <div className="text-center py-12 text-[var(--ink-lt)] text-[14px]">Tidak ada penulis ditemukan</div>
            )}
          </div>
        </div>
      )}

      {/* ── KELOMPOK TAB ── */}
      {tab === 'kelompok' && (
        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kelompokList.map(k => {
            const anggota = (k as any).kelompok_anggota ?? []
            const artikels = ((k as any).artikel ?? []).filter((a: any) => a.status === 'published')
            return (
              <div key={k.id} className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5 hover:border-[var(--coral)] hover:shadow-sm transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[var(--cream)] flex items-center justify-center font-display text-[18px] font-bold text-[var(--ink)] mb-3.5">
                  {String(k.nomor ?? '?').padStart(2,'0')}
                </div>
                <h3 className="font-semibold text-[var(--ink)] text-[15px] mb-1.5">{k.nama}</h3>
                {artikels.length > 0 && (
                  <p className="text-[12px] text-[var(--ink-lt)] mb-3.5 line-clamp-2">
                    📄 {artikels[0].judul}
                  </p>
                )}
                <div className="flex items-center">
                  {anggota.slice(0,3).map((a: any, i: number) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-[var(--coral)] border-2 border-white flex items-center justify-center text-[9px] font-bold text-white -ml-1 first:ml-0">
                      {(a.profiles?.nama_lengkap ?? 'U').slice(0,2).toUpperCase()}
                    </div>
                  ))}
                  <span className="text-[12px] text-[var(--ink-lt)] ml-2.5">
                    {anggota.map((a: any) => a.profiles?.nama_lengkap?.split(' ')[0]).filter(Boolean).join(' · ')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
