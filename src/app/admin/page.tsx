// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminStats } from '@/components/admin/AdminStats'
import { WorkflowTable } from '@/components/admin/WorkflowTable'
import { AllArticlesTable } from '@/components/admin/AllArticlesTable'
import { UploadPenulisForm } from '@/components/admin/UploadPenulisForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, FileText, Users, Settings } from 'lucide-react'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'it') {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] pt-32 pb-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#655348]/5 border border-[#655348]/10 text-[10px] font-black tracking-widest uppercase mb-4 text-[#655348]">
            <Settings size={12} /> Control Panel
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">
            Admin <span className="text-[#655348]">Dashboard</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Kelola alur kerja redaksi dan pengaturan anggota tim.</p>
        </div>

        {/* STATS SECTION */}
        <AdminStats />

        {/* TABS INTERFACE */}
        <Tabs defaultValue="workflow" className="mt-12">
          <TabsList className="bg-white border border-gray-100 p-1.5 rounded-[2rem] h-auto gap-2 shadow-sm mb-8">
            <TabsTrigger value="workflow" className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#655348] data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all">
              <LayoutDashboard size={14} className="mr-2" /> Workflow
            </TabsTrigger>
            <TabsTrigger value="articles" className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#655348] data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all">
              <FileText size={14} className="mr-2" /> Semua Artikel
            </TabsTrigger>
            <TabsTrigger value="authors" className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#655348] data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all">
              <Users size={14} className="mr-2" /> Kelola Anggota
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="mt-0">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <WorkflowTable />
            </div>
          </TabsContent>

          <TabsContent value="articles" className="mt-0">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <AllArticlesTable />
            </div>
          </TabsContent>

          <TabsContent value="authors" className="mt-0">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <UploadPenulisForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}