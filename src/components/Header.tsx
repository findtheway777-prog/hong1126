import { Phone } from 'lucide-react';
import { MUSEUM_INFO } from '../data/rentalFees';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#090A0D]/90 backdrop-blur-md text-white border-b border-white/12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          천안박물관 시설대관
        </a>

        <nav
          aria-label="주요 안내 단계"
          className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-slate-300"
        >
          <a
            href="#step-1-purpose"
            className="py-2 hover:text-[#E5B842] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            목적선택
          </a>
          <a
            href="#step-2-facilities"
            className="py-2 hover:text-[#E5B842] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            시설안내
          </a>
          <a
            href="#step-3-calculator"
            className="py-2 hover:text-[#E5B842] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            사용료계산
          </a>
          <a
            href="#step-4-process"
            className="py-2 hover:text-[#E5B842] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            신청절차
          </a>
          <a
            href="#step-5-contact"
            className="py-2 hover:text-[#E5B842] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            문의·FAQ
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <a
            href={MUSEUM_INFO.phoneHref}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] text-sm sm:text-[15px] font-bold transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{MUSEUM_INFO.phone}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
