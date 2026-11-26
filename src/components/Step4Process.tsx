import { useState } from 'react';
import { Check, FileText } from 'lucide-react';
import { RENTAL_STEPS, REQUIRED_DOCUMENTS } from '../data/rentalFees';

export function Step4Process() {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  function toggleDoc(id: string) {
    setCheckedDocs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  const checkedCount = REQUIRED_DOCUMENTS.filter(
    (doc) => checkedDocs[doc.id]
  ).length;

  return (
    <section
      id="step-4-process"
      aria-labelledby="step-4-heading"
      className="py-10 sm:py-14 border-b border-white/10 bg-[#090A0D]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm sm:text-base font-bold text-[#E5B842] tracking-wide">
            04. 신청 절차 및 준비서류
          </p>
          <h2
            id="step-4-heading"
            className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]"
          >
            방문 접수(선착순 · 1일 1단체)로 대관이 진행됩니다
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-slate-300 leading-relaxed">
            별도의 온라인 개인정보 입력 없이, 안내된 서류를 준비해 천안박물관
            관리팀에 방문 접수해 주시면 심사 후 사용허가가 확정됩니다.
          </p>
        </div>

        {/* 5-step process grid */}
        <ol className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {RENTAL_STEPS.map((step) => (
            <li
              key={step.stepNumber}
              className="bg-[#12141B] rounded-xl border border-white/12 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="text-sm font-bold text-[#E5B842] tabular-nums">
                  단계 {step.stepNumber}
                </div>
                <h3 className="mt-1 text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base font-semibold text-slate-200">
                  {step.summary}
                </p>
              </div>
              <p className="mt-3 pt-3 border-t border-white/10 text-sm sm:text-base text-slate-400 leading-relaxed">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>

        {/* Required Documents Checklist (No personal info inputs) */}
        <div className="mt-8 bg-[#12141B] rounded-xl border border-white/12 p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <FileText
                className="w-6 h-6 text-[#E5B842] shrink-0"
                aria-hidden="true"
              />
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                방문 접수 시 준비서류 체크리스트
              </h3>
            </div>
            <span className="text-sm sm:text-base font-semibold text-[#E5B842] tabular-nums">
              확인 완료 {checkedCount} / {REQUIRED_DOCUMENTS.length}건
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const checked = Boolean(checkedDocs[doc.id]);
              return (
                <button
                  key={doc.id}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between min-h-[132px] ${
                    checked
                      ? 'bg-[#191D28] text-white border-[#E5B842]'
                      : 'bg-[#161923] text-slate-100 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-sm font-bold text-[#E5B842]">
                          {doc.condition}
                        </span>
                        <h4 className="mt-0.5 text-lg sm:text-xl font-bold text-white">
                          {doc.title}
                        </h4>
                      </div>
                      <span
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-1 ${
                          checked
                            ? 'bg-[#E5B842] text-[#090A0D] border-[#E5B842]'
                            : 'bg-[#090A0D] border-white/25'
                        }`}
                      >
                        {checked && <Check className="w-4 h-4" aria-hidden="true" />}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm sm:text-base leading-snug text-slate-300">
                    {doc.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
