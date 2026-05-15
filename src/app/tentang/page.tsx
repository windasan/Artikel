import Image from 'next/image'
import { Target, Eye, Users, ShieldCheck, MapPin, Globe } from 'lucide-react'

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="bg-[#655348] pt-40 pb-24 px-6 relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[12px] font-black tracking-[0.4em] uppercase mb-8">
            Manifesto
          </div> */}
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-tight">
            Ruang Jelajah <br /> <span className="text-[#D9D9D9]">Pariwisata</span>
          </h1>
          <p className="text-[#D9D9D9] text-lg md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
kami berkomitmen memberikan perspektif segar dan solusi relevan melalui publikasi yang mendukung kemajuan industri pariwisata Indonesia di era digital          </p>
        </div>
      </section>

      {/* 2. VISI & MISI */}
<section className="max-w-7xl mx-auto px-6 py-24">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
    
    {/* Kartu Visi */}
    
    <div className="p-10 rounded-[3rem] bg-[#FDFBF7] border border-gray-100 flex flex-col justify-center items-center text-center shadow-2xl h-full">
      <div className="w-16 h-16 bg-[#655348] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
        <Eye size={32} />
      </div>
      <h2 className="text-3xl font-black text-[#655348] uppercase tracking-tighter mb-6">
        Visi Kami
      </h2>
      <p className="text-gray-600 leading-relaxed font-medium italic">
        "Menyediakan media informasi dan edukasi dalam mengenal potensi, isu, dan perkembangan pariwisata Indonesia."
      </p>
    </div>

    {/* Kartu Misi */}
    {/* Misi */}
<div className="p-10 rounded-[3rem] bg-[#655348] text-white flex flex-col items-center text-center shadow-2xl h-full">
  <div className="w-16 h-16 bg-[#D9D9D9] text-[#655348] rounded-2xl flex items-center justify-center mb-8 shadow-lg">
    <Target size={32} />
  </div>

  <h2 className="text-3xl font-black text-[#D9D9D9] uppercase tracking-tighter mb-6">
    Misi Kami
  </h2>

  <div className="text-[#D9D9D9]/80 leading-relaxed font-medium italic mx-6">
    {/* List menggunakan decimal (1, 2, 3, 4) dengan posisi outside agar rapi */}
    <ol className="list-decimal list-outside text-left space-y-4 pl-6 pb-6">
      <li className="pl-2">
        Menyajikan berbagai informasi mengenai sektor pariwisata secara menarik dan edukatif.
      </li>
      <li className="pl-2">
        Meningkatkan wawasan publik mengenai potensi, isu, dan perkembangan pariwisata Indonesia.
      </li>
      <li className="pl-2">
        Mendukung promosi pariwisata Indonesia melalui media digital.
      </li>
      <li className="pl-2">
        Menjadi wadah bagi mahasiswa dalam menulis dan berbagi informasi pariwisata.
      </li>
    </ol>
  </div>
</div>

  </div>
</section>
      {/* 3. CORE VALUES (NILAI UTAMA) */}
      {/* <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#655348] uppercase tracking-tighter">Nilai Perjuangan</h2>
            <div className="w-24 h-1 bg-[#655348] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <ShieldCheck />, title: "Integritas", desc: "Menjunjung tinggi orisinalitas dalam setiap karya tulis." },
              { icon: <Users />, title: "Kolaborasi", desc: "Sinergi antar mahasiswa Pariwisata Kelas A UNY." },
              { icon: <Globe />, title: "Keberlanjutan", desc: "Fokus pada isu pariwisata ramah lingkungan." },
              { icon: <MapPin />, title: "Lokalitas", desc: "Mengangkat potensi wisata nusantara ke mata dunia." }
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 text-center">
                <div className="w-12 h-12 mx-auto bg-[#655348]/5 text-[#655348] rounded-xl flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm mb-3">{value.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed italic">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* 4. TEAM IDENTITAS */}
     <section className="max-w-7xl mx-auto px-6 py-24 text-center">
  {/* Cleanup struktur div duplikat */}
  
  <h2 className="text-3xl md:text-5xl px-14 font-black text-[#1A1A1A] tracking-tighter uppercase mb-20">
    Dikelola Oleh <span className="text-[#655348]">Kelas A</span>
  </h2>

  {/* Kontainer Utama untuk Gambar & Teks Box Overlay (Wajib Relative) */}
  {/* Margin Bottom dinaikkan (mb-28) untuk memberi ruang bagi teks yang keluar border */}
  <div className="relative max-w-5xl mx-auto mb-28">
    
    {/* 1. Kontainer Gambar */}
    <div className="relative rounded-[3rem] overflow-hidden aspect-video shadow-2xl">
      <Image 
        src="/Images/photo.jpg" 
        alt="Pariwisata Kelas A UNY" 
        fill 
        className="object-cover"
        priority // Tambahkan ini karena gambar ada di bagian atas halaman
      />
      {/* Overlay Gelap di atas gambar agar teks lebih terbaca */}
      <div className="absolute inset-0 bg-[#1A1A1A]/40" />
    </div>

    {/* 2. Teks Box "Tourism UNY '23" (Wajib Absolute) */}
    {/* Posisi: bottom negative (-bottom-10) agar keluar dari border, z-10 agar menumpuk di paling atas */}
    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10 p-6 md:p-8 border-4 border-white/50 rounded-[2rem] backdrop-blur-md bg-white/10 shadow-lg whitespace-nowrap">
      <p className="text-white text-lg md:text-2xl font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">
        Tourism UNY '23
      </p>
    </div>
  </div>

  {/* Quote di bagian bawah */}
  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto italic">
    "Ruang Jelajah Pariwisata adalah bukti nyata kolektifitas kami. Kami percaya bahwa pemikiran yang dibagikan adalah langkah awal dari perubahan industri pariwisata yang lebih baik."
  </p>
</section>
    </main>
  )
}