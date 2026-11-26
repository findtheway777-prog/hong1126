import { useEffect, useState } from 'react';
import { ArrowDown, ExternalLink, MapPin, MessageSquare } from 'lucide-react';
import { HERO_MUSEUM_SLIDES } from '../data/facilityMedia';
import { MUSEUM_INFO } from '../data/rentalFees';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onOpenChat: () => void;
}

const SLIDE_INTERVAL_MS = 3000;

export function HeroSection({ onOpenChat }: HeroSectionProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    if (HERO_MUSEUM_SLIDES.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HERO_MUSEUM_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const currentSlide =
    HERO_MUSEUM_SLIDES[activeSlideIndex] || HERO_MUSEUM_SLIDES[0];

  return (
    <section
      id="top"
      className="bg-lamborghini-canvas text-white border-b border-white/12"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <p className="text-sm sm:text-base font-bold text-[#E5B842] tracking-wide mb-3">
                천안시 공공문화시설 대관 안내
              </p>
              <h1 className="text-[clamp(1.2rem,5.1vw,2.25rem)] font-bold leading-tight tracking-tight text-white whitespace-nowrap">
                천안박물관 시설 대관 원스톱 안내
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                공연장(278석)과 아카이브 세미나실의 대관 가능 목적, 이용 시간,
                예상 사용료 계산부터 방문 접수 절차까지 별도 회원가입이나 개인정보
                입력 없이 한 번에 확인하실 수 있습니다.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="#step-3-calculator"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 py-3 rounded-xl bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] text-base sm:text-lg font-bold transition-colors whitespace-nowrap"
              >
                <span>사용료 바로 계산하기</span>
                <ArrowDown className="w-5 h-5" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 py-3 rounded-xl bg-[#161821] text-white border border-white/20 hover:border-[#E5B842] text-base sm:text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-[#E5B842]" aria-hidden="true" />
                <span>AI 대관 안내 상담</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-60 sm:h-72 lg:h-full min-h-[260px] rounded-xl overflow-hidden border border-white/15 bg-[#12141B]">
              {HERO_MUSEUM_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <div
                    key={slide.src}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <ResilientImage
                      src={slide.src}
                      alt={slide.alt}
                      fallbackTitle="천안박물관"
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}

              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 bg-gradient-to-t from-[#090A0D]/95 via-[#090A0D]/25 to-[#090A0D]/45 pointer-events-none"
              />

              {/* Top slide label & 3s indicator controls */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#090A0D]/80 backdrop-blur-sm border border-white/15 text-xs sm:text-sm font-semibold text-slate-100">
                  {currentSlide.label}
                </span>

                <div
                  className="flex items-center gap-1.5 bg-[#090A0D]/75 backdrop-blur-sm px-2 py-1.5 rounded-md border border-white/15"
                  role="tablist"
                  aria-label="천안박물관 시설 사진 선택"
                >
                  {HERO_MUSEUM_SLIDES.map((slide, idx) => {
                    const isSelected = idx === activeSlideIndex;
                    return (
                      <button
                        key={slide.src}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        aria-label={`${slide.label} 보기`}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`h-1.5 transition-all cursor-pointer rounded-xs ${
                          isSelected
                            ? 'w-5 bg-[#E5B842]'
                            : 'w-2.5 bg-white/35 hover:bg-white/65'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-5">
                <a
                  href={MUSEUM_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#E5B842] hover:underline"
                >
                  <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{MUSEUM_INFO.address}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </a>
                <p className="text-sm text-slate-200 mt-1">
                  365일 연중 운영 (월~일 전 요일 대관 가능)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width operational summary row below hero split */}
        <dl className="mt-8 pt-6 border-t border-white/12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <dt className="text-xs sm:text-sm text-slate-400 font-medium">
              공연장 규모 · 시간
            </dt>
            <dd className="mt-1 text-base sm:text-lg font-bold text-white tabular-nums">
              278석 · 09:00~22:00
            </dd>
          </div>
          <div>
            <dt className="text-xs sm:text-sm text-slate-400 font-medium">
              아카이브 세미나실
            </dt>
            <dd className="mt-1 text-base sm:text-lg font-bold text-white">
              3시간 이내 · 무료
            </dd>
          </div>
          <div>
            <dt className="text-xs sm:text-sm text-slate-400 font-medium">
              운영 요일 안내
            </dt>
            <dd className="mt-1 text-base sm:text-lg font-bold text-[#E5B842]">
              365일 연중 대관 가능
            </dd>
          </div>
          <div>
            <dt className="text-xs sm:text-sm text-slate-400 font-medium">
              접수 방식 · 원칙
            </dt>
            <dd className="mt-1 text-base sm:text-lg font-bold text-white">
              방문 선착순 · 1일 1단체
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
