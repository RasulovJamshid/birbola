import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090318] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#d946ef]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <Image src="/assets/birbola.svg" alt="Birbola" width={120} height={40} className="mb-10 opacity-80" />

        <p className="text-8xl font-black text-[#d946ef] mb-2 leading-none">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Sahifa topilmadi</h1>
        <p className="text-white/40 mb-10 leading-relaxed">
          Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi mumkin.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link href="/" className="btn-primary">
            Bosh sahifaga qaytish
          </Link>
          <Link href="/search" className="btn-secondary">
            Bog&apos;chalarni ko&apos;rish
          </Link>
        </div>
      </div>
    </div>
  )
}
