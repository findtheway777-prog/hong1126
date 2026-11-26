import { useState } from 'react';
import {
  ChevronDown,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { FAQ_ITEMS, MUSEUM_INFO } from '../data/rentalFees';

interface Step5ContactAndFaqProps {
  onOpenChat: () => void;
}

export function Step5ContactAndFaq({ onOpenChat }: Step5ContactAndFaqProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    FAQ_ITEMS[0]?.id ?? null
  );

  function toggleFaq(id: string) {
    setOpenFaqId((prev) => (prev === id ? null : id));
  }

  return (
    <section
      id="step-5-contact"
      aria-labelledby="step-5-heading"
      className="py-10 sm:py-14 bg-[#0D0F14]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Step 5: Contact */}
        <div>
          <div className="max-w-3xl">
            <p className="text-sm sm:text-base font-bold text-[#E5B842] tracking-wide">
              05. 대관 문의
            </p>
            <h2
              id="step-5-heading"
              className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]"
            >
              일정 확인 및 방문 접수 상담은 관리팀으로 연락해 주세요
            </h2>
          </div>

          <div className="mt-6 rounded-xl bg-[#12141B] border border-[#E5B842]/40 text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm sm:text-base font-semibold text-[#E5B842]">
                {MUSEUM_INFO.department} · 대관 접수 및 시설 상담
              </p>
              <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-white">
                {MUSEUM_INFO.phone}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-slate-300 leading-relaxed">
                <a
                  href={MUSEUM_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#E5B842] hover:underline font-semibold"
                >
                  <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{MUSEUM_INFO.address}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </a>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span>365일 연중 운영 (월~일요일 전 요일 대관 가능)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={MUSEUM_INFO.phoneHref}
                className="inline-flex items-center justify-center gap-2.5 min-h-[54px] px-7 py-3.5 rounded-xl bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] text-lg font-bold transition-colors whitespace-nowrap"
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                <span>전화 연결하기</span>
              </a>
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center justify-center gap-2.5 min-h-[54px] px-6 py-3.5 rounded-xl bg-[#181B24] text-white border border-white/20 hover:border-[#E5B842] text-base sm:text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-[#E5B842]" aria-hidden="true" />
                <span>AI 안내 챗봇 열기</span>
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div id="faq-section" className="pt-8 border-t border-white/10">
          <div className="max-w-3xl">
            <p className="text-sm sm:text-base font-bold text-[#E5B842] tracking-wide">
              자주 묻는 질문 (FAQ)
            </p>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              시설 대관 전 꼭 확인해 주세요
            </h2>
          </div>

          <div className="mt-6 divide-y divide-white/10 border-t border-b border-white/10">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`panel-${item.id}`}
                    onClick={() => toggleFaq(item.id)}
                    className="w-full py-5 px-2 sm:px-4 flex items-center justify-between gap-4 text-left hover:bg-[#12141B] transition-colors cursor-pointer min-h-[60px]"
                  >
                    <span className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-6 h-6 text-[#E5B842] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`panel-${item.id}`}
                      className="px-2 sm:px-4 pb-6 pt-1 text-base sm:text-lg text-slate-300 leading-relaxed max-w-4xl"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
