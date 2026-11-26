import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  PURPOSE_OPTIONS,
  RESTRICTED_PURPOSES,
  RESTRICTED_PURPOSE_NOTICE,
  type FacilityId,
  type PurposeId,
} from '../data/rentalFees';

interface Step1PurposeProps {
  selectedPurpose: PurposeId;
  onSelectPurpose: (purpose: PurposeId) => void;
  onApplyRecommendedFacility: (facilityId: FacilityId) => void;
}

export function Step1Purpose({
  selectedPurpose,
  onSelectPurpose,
  onApplyRecommendedFacility,
}: Step1PurposeProps) {
  const activeOption =
    PURPOSE_OPTIONS.find((item) => item.id === selectedPurpose) ||
    PURPOSE_OPTIONS[0];

  return (
    <section
      id="step-1-purpose"
      aria-labelledby="step-1-heading"
      className="py-10 sm:py-14 border-b border-white/10 bg-[#0D0F14]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm sm:text-base font-bold text-[#E5B842] tracking-wide">
            01. 대관 목적 선택
          </p>
          <h2
            id="step-1-heading"
            className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]"
          >
            어떤 목적으로 시설을 이용하시나요?
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-slate-300 leading-relaxed">
            행사 성격에 맞는 목적을 선택하시면 적합한 시설과 이용 기준을 바로
            안내해 드립니다.
          </p>
        </div>

        {/* Purpose Segmented Cards */}
        <div
          role="radiogroup"
          aria-label="대관 목적 선택"
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {PURPOSE_OPTIONS.map((option) => {
            const isSelected = option.id === selectedPurpose;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectPurpose(option.id)}
                className={`text-left p-5 sm:p-6 rounded-xl border transition-colors cursor-pointer min-h-[120px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#191D28] text-white border-[#E5B842] shadow-sm'
                    : 'bg-[#12141B] text-slate-100 border-white/10 hover:border-white/30 hover:bg-[#161923]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight">
                      {option.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2
                        className="w-6 h-6 text-[#E5B842] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-base leading-snug text-slate-300">
                    {option.headline}
                  </p>
                </div>
                <p
                  className={`mt-4 pt-3 border-t text-sm font-semibold ${
                    isSelected
                      ? 'border-[#E5B842]/30 text-[#E5B842]'
                      : 'border-white/10 text-slate-300'
                  }`}
                >
                  추천 시설 · {option.recommendedFacilityName}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Purpose Details */}
        <div className="mt-6 p-5 sm:p-7 rounded-xl border border-white/12 bg-[#141720]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#E5B842]">
                선택된 목적 안내 · {activeOption.label}
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white">
                {activeOption.recommendedFacilityName} 추천
              </h3>
              <p className="mt-2 text-base sm:text-lg text-slate-200 leading-relaxed">
                {activeOption.description}
              </p>
              <p className="mt-2 text-sm sm:text-base font-medium text-slate-400">
                참고: {activeOption.eligibilityNote}
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm sm:text-base text-slate-300">
                {activeOption.examples.map((ex) => (
                  <li key={ex} className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="text-[#E5B842] font-bold"
                    >
                      ·
                    </span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() =>
                  onApplyRecommendedFacility(activeOption.recommendedFacility)
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-xl bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] text-base font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>이 시설로 사용료 계산</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Ineligible Purpose Notice */}
        <div
          role="note"
          aria-label="공연장 대관 불가 목적 안내"
          className="mt-6 p-5 sm:p-6 rounded-xl border border-red-500/40 bg-red-950/35"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-6 h-6 text-red-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-red-200">
                {RESTRICTED_PURPOSE_NOTICE}
              </h3>
              <p className="mt-1 text-base text-red-100/90">
                공공 박물관의 설립 목적 및 시설 운영 규정에 따라 아래 성격의
                행사는 대관이 허가되지 않습니다.
              </p>
              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-red-500/25">
                {RESTRICTED_PURPOSES.map((item) => (
                  <div key={item.title}>
                    <dt className="text-base font-bold text-red-200">
                      {item.title}
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base text-red-100/80 leading-snug">
                      {item.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
