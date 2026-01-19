import { FileText, Copy, ArrowLeftRight, ExternalLink, Pin, Coffee, CreditCard, Columns2 } from 'lucide-react'
import './Dashboard.css'

const layoutCards = [
  {
    id: '1s',
    title: 'IDC 1S',
    description: ['Layout satu sisi', '(10 kartu per halaman)'],
    icon: FileText,
    gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600',
    gradientStyle: 'linear-gradient(to bottom right, #3b82f6, #2563eb, #4f46e5)'
  },
  {
    id: '2s-sama',
    title: 'IDC 2S (Sama Sisi)',
    description: ['Layout dua sisi gambar sama', '(5 pasang per halaman)'],
    icon: Copy,
    gradient: 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600',
    gradientStyle: 'linear-gradient(to bottom right, #7c3aed, #9333ea, #c026d3)'
  },
  {
    id: 'kanan-kiri-beda',
    title: 'IDC 2S (Sisi Berbeda)',
    description: ['Layout dua sisi gambar berbeda', '(5 pasang per halaman)'],
    icon: ArrowLeftRight,
    gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-orange-600',
    gradientStyle: 'linear-gradient(to bottom right, #f97316, #ef4444, #f97316)'
  },
  {
    id: 'ganci-pin',
    title: 'Layout Ganci/Pin',
    description: ['Layout ganci/pin', '(3x5 atau 3x3 grid per halaman)'],
    icon: Pin,
    gradient: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
    gradientStyle: 'linear-gradient(to bottom right, #10b981, #14b8a6, #0891b2)'
  },
  {
    id: 'mug',
    title: 'Layout Mug',
    description: ['Layout mug', '(20x10 cm, A4 landscape)'],
    icon: Coffee,
    gradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
    gradientStyle: 'linear-gradient(to bottom right, #f59e0b, #f97316, #ef4444)'
  },
  {
    id: 'lanyard',
    title: 'Layout Lanyard',
    description: ['Layout lanyard', '(2 kolom x 8 baris)'],
    icon: CreditCard,
    gradient: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500',
    gradientStyle: 'linear-gradient(to bottom right, #ec4899, #f43f5e, #ef4444)'
  },
  {
    id: 'dual-lanyard',
    title: 'Layout Dual Lanyard',
    description: ['Layout lanyard 2 kolom', '(Pendek & Panjang)'],
    icon: Columns2,
    gradient: 'bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500',
    gradientStyle: 'linear-gradient(to bottom right, #a855f7, #6366f1, #3b82f6)'
  }
]

function Dashboard({ onSelectLayout }) {
  return (
    <div className="dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {layoutCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.id}
              className={`
                ${card.gradient} 
                rounded-2xl p-4 
                text-white 
                hover:scale-105 
                transition-transform duration-300 
                cursor-pointer
                shadow-lg hover:shadow-xl
              `}
              style={{ background: card.gradientStyle }}
              onClick={() => onSelectLayout(card.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5">
                  <Icon className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </div>

              <h3 className="text-lg font-bold mb-1">{card.title}</h3>
              <p className="text-white/90 text-sm">
                {card.description[0]}
                <br />
                {card.description[1]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard

