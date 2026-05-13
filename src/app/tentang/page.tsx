import Image from 'next/image'
import { Target, Eye, Users, ShieldCheck, MapPin, Globe } from 'lucide-react'

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="bg-[#655348] pt-40 pb-24 px-6 relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[12px] font-black tracking-[0.4em] uppercase mb-8">
            Manifesto
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-tight">
            Ruang Jelajah <br /> <span className="text-[#D9D9D9]">Pariwisata</span>
          </h1>
          <p className="text-[#D9D9D9] text-lg md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
            "Lebih dari sekadar jurnal; ini adalah wadah intelektual mahasiswa Pariwisata Kelas A UNY dalam merespon dinamika industri global."
          </p>
        </div>
      </section>

      {/* 2. VISI & MISI */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Visi */}
          <div className="p-10 rounded-[3rem] bg-[#FDFBF7] border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#655348] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <Eye size={32} />
            </div>
            <h2 className="text-3xl font-black text-[#655348] uppercase tracking-tighter mb-6">Visi Kami</h2>
            <p className="text-gray-600 leading-relaxed font-medium italic">
              Menjadi platform publikasi digital terkemuka yang mengintegrasikan pemikiran kritis mahasiswa dengan tren pariwisata berkelanjutan di Indonesia.
            </p>
          </div>

          {/* Misi */}
          <div className="p-10 rounded-[3rem] bg-[#655348] text-white flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#D9D9D9] text-[#655348] rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <Target size={32} />
            </div>
            <h2 className="text-3xl font-black text-[#D9D9D9] uppercase tracking-tighter mb-6">Misi Kami</h2>
            <p className="text-[#D9D9D9]/80 leading-relaxed font-medium italic">
              Mendorong literasi riset, memfasilitasi kolaborasi antar mahasiswa, dan menyediakan referensi edukatif yang relevan bagi akademisi maupun praktisi pariwisata.
            </p>
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
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase mb-12">
          Dikelola Oleh <span className="text-[#655348]">Kelas A</span>
        </h2>
        
        <div className="relative rounded-[3rem] overflow-hidden aspect-video shadow-2xl mb-12">
          {/* Ganti dengan foto kelas jika ada */}
          <Image 
            src="/Images/BGTM.jpeg" 
            alt="Pariwisata Kelas A UNY" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#655348]/40 flex items-center justify-center">
            <div className="p-8 border-4 border-white/30 rounded-[2rem] backdrop-blur-sm">
              <p className="text-white text-2xl font-black uppercase tracking-[0.5em]">Tourism UNY '23</p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto italic">
          "Ruang Jelajah Pariwisata adalah bukti nyata kolektifitas kami. Kami percaya bahwa pemikiran yang dibagikan adalah langkah awal dari perubahan industri pariwisata yang lebih baik."
        </p>
      </section>
    </main>
  )
}