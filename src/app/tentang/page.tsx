// src/app/tentang/page.tsx
export default function TentangPage() {
  const values = [
    { icon:'🔬', title:'Rigor Akademik',    desc:'Setiap artikel melewati proses peer review internal sebelum dipublikasikan.' },
    { icon:'🌐', title:'Open Access Penuh', desc:'Seluruh artikel dapat diakses gratis oleh publik, mendukung ekosistem ilmu terbuka.' },
    { icon:'🤝', title:'Kolaborasi Tim',    desc:'Platform mendorong riset berkelompok yang mencerminkan praktik profesional industri.' },
    { icon:'📊', title:'Berbasis Data',     desc:'Setiap klaim didukung data yang dapat ditelusuri dan diverifikasi.' },
  ]
  const team = [
    { inisial:'RS', nama:'Rafi Santoso',     nim:'21812141001', role:'Chief Editor',   bg:'var(--coral)' },
    { inisial:'DP', nama:'Dian Permata',     nim:'21812141002', role:'Web Admin',      bg:'var(--sky)' },
    { inisial:'MF', nama:'Muhammad Faisal',  nim:'21812141004', role:'Reviewer',       bg:'var(--gold)' },
    { inisial:'SR', nama:'Siti Rahma',       nim:'21812141005', role:'Editor',         bg:'var(--sage)' },
  ]
  return (
    <>
      <div className="pt-[100px] pb-16 px-6 text-center bg-gradient-to-b from-[var(--cream)] to-[var(--paper)]">
        <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--coral)] block mb-3">Platform</span>
        <h1 className="font-display text-[52px] font-bold text-[var(--ink)] tracking-tight mb-4">Tentang Jurnal Pariwisata</h1>
        <p className="text-[16px] text-[var(--ink-lt)] max-w-[520px] mx-auto leading-[1.75]">
          Ruang publikasi kolaboratif mahasiswa Pariwisata Kelas A UNY — menggabungkan rigor akademik dengan narasi humanis.
        </p>
      </div>
      <div className="max-w-[1080px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 mb-8">
        <div>
          <h2 className="font-display text-[28px] font-bold text-[var(--ink)] mb-5 tracking-tight">Mengapa Platform Ini Ada</h2>
          <p className="text-[14px] text-[var(--ink-lt)] leading-[1.8] mb-4">
            Kami percaya bahwa karya akademik mahasiswa layak mendapat ruang publikasi yang setara dengan jurnal ilmiah profesional. Mahasiswa adalah peneliti muda yang pandangannya segar, relevan, dan bernilai tinggi bagi perkembangan ilmu pariwisata.
          </p>
          <p className="text-[14px] text-[var(--ink-lt)] leading-[1.8]">
            Portal ini lahir dari kebutuhan konkret: menyediakan medium publikasi yang tidak hanya dapat diakses bebas oleh publik, tetapi juga mampu merepresentasikan kualitas riset mahasiswa secara adil dan terhormat.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {values.map(v => (
            <div key={v.title} className="flex gap-4 p-4 bg-white border border-[rgba(28,43,43,0.10)] rounded-xl hover:border-[var(--coral)] transition-colors">
              <span className="text-[22px] flex-shrink-0">{v.icon}</span>
              <div>
                <p className="font-semibold text-[var(--ink)] text-[14px] mb-0.5">{v.title}</p>
                <p className="text-[13px] text-[var(--ink-lt)] leading-[1.55]">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-[1080px] mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--coral)] block mb-2">Tim</span>
          <h2 className="font-display text-[32px] font-bold text-[var(--ink)] tracking-tight">Pengelola Platform</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map(m => (
            <div key={m.nim} className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5 text-center hover:border-[var(--coral)] hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-[22px] font-bold text-white" style={{ background: m.bg }}>{m.inisial}</div>
              <p className="font-semibold text-[var(--ink)] text-[14px]">{m.nama}</p>
              <p className="text-[11px] text-[var(--ink-lt)] mb-2">{m.nim}</p>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--sage-lt)] text-[#3D7050]">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#1C2B2B] to-[#2A3F3F] py-14 px-6 text-center">
        <div className="w-[68px] h-[68px] rounded-full bg-white/90 mx-auto mb-5 flex items-center justify-center text-3xl shadow-xl">🏫</div>
        <p className="text-[17px] font-semibold text-white/90 mb-1.5">Kementerian Pendidikan Tinggi, Sains, dan Teknologi RI</p>
        <p className="text-[13px] text-white/45 mb-6">Universitas Negeri Yogyakarta · Prodi Pariwisata · Kelas A</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {['🔬 BRIN','💰 LPDP','🎓 UNY','📚 FISIPOL'].map(p => (
            <div key={p} className="px-5 py-2 rounded-full bg-white/10 border border-white/15 text-white/80 text-[13px] font-semibold">{p}</div>
          ))}
        </div>
        <p className="text-[11px] text-white/25 border-t border-white/8 pt-5 mt-6">
          Hak Cipta © 2025 Program Studi Pariwisata Kelas A, Universitas Negeri Yogyakarta
        </p>
      </div>
    </>
  )
}
