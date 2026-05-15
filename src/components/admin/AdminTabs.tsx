// src/components/admin/AdminTabs.tsx
'use client'

import { useState } from 'react'
import { LayoutDashboard, FileText, Users } from 'lucide-react'
import { WorkflowTable } from '@/components/admin/WorkflowTable'
import { AllArticlesTable } from '@/components/admin/AllArticlesTable'
import { UploadPenulisForm } from '@/components/admin/UploadPenulisForm'
import type { ArtikelLengkap, Profile } from '@/types/database'

// Menerima data dari halaman server
interface AdminTabsProps {
  pendingRedaksi: ArtikelLengkap[]
  pendingPublikasi: ArtikelLengkap[]
  allArtikel: ArtikelLengkap[]
  penulisList: Profile[]
}

export function AdminTabs({ pendingRedaksi, pendingPublikasi, allArtikel, penulisList }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState('workflow')

  return (
    <div className="mt-12">
      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap bg-white border border-gray-100 p-1.5 rounded-[2rem] gap-2 shadow-sm mb-8 w-fit">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center rounded-full px-6 py-2.5 font-bold text-xs uppercase tracking-widest transition-all ${
            activeTab === 'workflow' ? 'bg-[#655348] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <LayoutDashboard size={14} className="mr-2" /> Workflow
        </button>
        
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center rounded-full px-6 py-2.5 font-bold text-xs uppercase tracking-widest transition-all ${
            activeTab === 'articles' ? 'bg-[#655348] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <FileText size={14} className="mr-2" /> Semua Artikel
        </button>

        <button
          onClick={() => setActiveTab('authors')}
          className={`flex items-center rounded-full px-6 py-2.5 font-bold text-xs uppercase tracking-widest transition-all ${
            activeTab === 'authors' ? 'bg-[#655348] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Users size={14} className="mr-2" /> Kelola Anggota
        </button>
      </div>

      {/* TABS CONTENT */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
        
        {activeTab === 'workflow' && (
          <div className="flex flex-col gap-12">
            {/* Bagian Redaksi */}
            <div>
               <h3 className="text-lg font-black text-gray-900 mb-5 tracking-tight flex items-center gap-3">
                 ✏️ Antrian Redaksi
                 {pendingRedaksi.length > 0 && (
                   <span className="bg-amber-100 text-amber-700 text-[11px] px-2.5 py-1 rounded-full">{pendingRedaksi.length}</span>
                 )}
               </h3>
               {pendingRedaksi.length > 0 ? (
                 <WorkflowTable articles={pendingRedaksi} stage="redaksi" />
               ) : (
                 <p className="text-gray-400 italic text-sm">Tidak ada artikel menunggu review redaksi.</p>
               )}
            </div>
            
            {/* Bagian Publikasi */}
            <div>
               <h3 className="text-lg font-black text-gray-900 mb-5 tracking-tight flex items-center gap-3">
                 🚀 Antrian Publikasi
                 {pendingPublikasi.length > 0 && (
                   <span className="bg-[#655348]/10 text-[#655348] text-[11px] px-2.5 py-1 rounded-full">{pendingPublikasi.length}</span>
                 )}
               </h3>
               {pendingPublikasi.length > 0 ? (
                 <WorkflowTable articles={pendingPublikasi} stage="publikasi" />
               ) : (
                 <p className="text-gray-400 italic text-sm">Tidak ada artikel menunggu publikasi.</p>
               )}
            </div>
          </div>
        )}

        {/* HANYA PANGGIL KOMPONENNYA SAJA KARENA ALLARTICLESTABLE SUDAH FETCH DATA SENDIRI */}
        {activeTab === 'articles' && <AllArticlesTable />}
        
        {activeTab === 'authors' && <UploadPenulisForm penulisList={penulisList} />}
      </div>
    </div>
  )
}