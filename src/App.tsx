import { useEffect, useState } from 'react';
import { Calculator, ExternalLink, MessageSquare, Phone } from 'lucide-react';
import {
  MUSEUM_INFO,
  PURPOSE_OPTIONS,
  type FacilityId,
  type PurposeId,
} from './data/rentalFees';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Step1Purpose } from './components/Step1Purpose';
import { Step2Facilities } from './components/Step2Facilities';
import { Step3Calculator } from './components/Step3Calculator';
import { Step4Process } from './components/Step4Process';
import { Step5ContactAndFaq } from './components/Step5ContactAndFaq';
import { RentalChatbot } from './components/RentalChatbot';

export default function App() {
  const [selectedPurpose, setSelectedPurpose] =
    useState<PurposeId>('performance');
  const [calculatorFacility, setCalculatorFacility] =
    useState<FacilityId>('auditorium');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
    };
  }, []);

  function handleSelectPurpose(purpose: PurposeId) {
    setSelectedPurpose(purpose);
    const matched = PURPOSE_OPTIONS.find((p) => p.id === purpose);
    if (matched) {
      setCalculatorFacility(matched.recommendedFacility);
    }
  }

  function jumpToCalculatorWithFacility(facilityId: FacilityId) {
    setCalculatorFacility(facilityId);
    const el = document.getElementById('step-3-calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#090A0D] bg-lamborghini-canvas text-[#F8FAFC] pb-16 lg:pb-0">
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-20 bg-carbon-grain"
      />
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header />

      <main className="flex-1">
        <HeroSection onOpenChat={() => setIsChatOpen(true)} />

        <Step1Purpose
          selectedPurpose={selectedPurpose}
          onSelectPurpose={handleSelectPurpose}
          onApplyRecommendedFacility={jumpToCalculatorWithFacility}
        />

        <Step2Facilities
          onSelectFacilityForCalc={jumpToCalculatorWithFacility}
        />

        <Step3Calculator
          facilityId={calculatorFacility}
          onChangeFacility={setCalculatorFacility}
        />

        <Step4Process />

        <Step5ContactAndFaq onOpenChat={() => setIsChatOpen(true)} />
      </main>

      <footer className="bg-[#060709] text-slate-300 border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm sm:text-base">
          <div>
            <p className="font-bold text-white">{MUSEUM_INFO.name} 시설 대관 안내</p>
            <p className="mt-1 text-slate-300">
              <a
                href={MUSEUM_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E5B842] hover:underline inline-flex items-center gap-1"
              >
                <span>{MUSEUM_INFO.address}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </a>{' '}
              · {MUSEUM_INFO.department} {MUSEUM_INFO.phone}
            </p>
          </div>
          <p className="text-slate-400">
            365일 연중 운영 (월~일요일) · 방문 선착순(1일 1단체) 접수
          </p>
        </div>
      </footer>

      {/* Desktop Floating AI Guidance Button */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="inline-flex items-center gap-2.5 min-h-[52px] px-5 py-3 rounded-xl bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] shadow-lg text-base font-bold transition-colors cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
          <span>AI 대관 안내 상담</span>
        </button>
      </div>

      {/* Mobile Compact Bottom Action Bar (<= 15% viewport height) */}
      <nav
        aria-label="모바일 빠른 실행"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#090A0D]/95 backdrop-blur-md border-t border-white/15 grid grid-cols-3"
      >
        <a
          href="#step-3-calculator"
          className="flex items-center justify-center gap-1.5 text-sm font-bold text-white hover:bg-white/5 whitespace-nowrap"
        >
          <Calculator className="w-4 h-4 shrink-0 text-[#E5B842]" aria-hidden="true" />
          <span>사용료 계산</span>
        </a>
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="flex items-center justify-center gap-1.5 text-sm font-bold text-white border-l border-r border-white/15 hover:bg-white/5 whitespace-nowrap cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 shrink-0 text-[#E5B842]" aria-hidden="true" />
          <span>AI 안내</span>
        </button>
        <a
          href={MUSEUM_INFO.phoneHref}
          className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#090A0D] bg-[#E5B842] hover:bg-[#F2C95C] whitespace-nowrap"
        >
          <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>전화 문의</span>
        </a>
      </nav>

      <RentalChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
