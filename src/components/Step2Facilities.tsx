import { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';
import {
  AUDITORIUM_TIME_SLOTS,
  EQUIPMENT_FEES,
  FACILITIES,
  MUSEUM_INFO,
  PRE_USE_RATE_MULTIPLIER,
  formatKrw,
  type FacilityId,
} from '../data/rentalFees';
import { FACILITY_MEDIA } from '../data/facilityMedia';
import { MuseumGoogleMap } from './MuseumGoogleMap';
import { ResilientImage } from './ResilientImage';

interface GroundingPlace {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}

interface MapsResponseData {
  text: string;
  places: GroundingPlace[];
}

interface Step2FacilitiesProps {
  onSelectFacilityForCalc: (facilityId: FacilityId) => void;
}

const PRESET_MAP_QUERIES = [
  {
    label: '위치 · 주차장 안내',
    query: '천안박물관 위치, 자동차 방문 시 진입 경로와 주차장 이용 정보를 알려주세요.',
  },
  {
    label: '대중교통 · 버스',
    query: '천안역이나 천안터미널에서 천안박물관으로 가는 버스 등 대중교통 경로를 알려주세요.',
  },
  {
    label: '주변 편의시설 · 식당',
    query: '천안박물관 행사 방문객이 이용할 수 있는 인근 카페나 식당, 편의시설을 알려주세요.',
  },
];

export function Step2Facilities({
  onSelectFacilityForCalc,
}: Step2FacilitiesProps) {
  const [mapQuery, setMapQuery] = useState(PRESET_MAP_QUERIES[0].query);
  const [mapResult, setMapResult] = useState<MapsResponseData | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useMyLocation, setUseMyLocation] = useState(false);

  const facilityList = [FACILITIES.auditorium, FACILITIES.seminar_room];

  async function fetchMapsInfo(queryText: string, withGeo = useMyLocation) {
    setIsLoadingMap(true);
    setMapError(null);

    let lat: number | undefined;
    let lng: number | undefined;

    if (withGeo && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 60000,
            });
          }
        );
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch {
        // 위치 권한 거부 시 기본 천안박물관 좌표 사용
      }
    }

    try {
      const res = await fetch('/api/maps-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, lat, lng }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '지도 정보를 조회하지 못했습니다.');
      }
      setMapResult({
        text: data.text,
        places: Array.isArray(data.places) ? data.places : [],
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Google Maps 정보를 불러오는 중 오류가 발생했습니다.';
      setMapError(msg);
    } finally {
      setIsLoadingMap(false);
    }
  }

  return (
    <section
      id="step-2-facilities"
      aria-labelledby="step-2-heading"
      className="py-10 sm:py-14 border-b border-white/10 bg-[#090A0D]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm sm:text-base font-bold text-[#E5B842] tracking-wide">
            02. 대관 시설 안내
          </p>
          <h2
            id="step-2-heading"
            className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]"
          >
            대관 가능 시설 및 요금 기준
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-slate-300 leading-relaxed">
            행사 규모에 따라 공연장(278석)과 아카이브 세미나실(무료) 중 선택할
            수 있으며, 두 시설 모두 365일 연중 운영으로 월요일을 포함해 전 요일
            대관이 가능합니다.
          </p>
        </div>

        {/* 2 Facilities Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {facilityList.map((facility) => {
            const media = FACILITY_MEDIA[facility.id];
            return (
              <article
                key={facility.id}
                className="bg-[#12141B] rounded-xl border border-white/12 overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/10] w-full bg-[#090A0D] overflow-hidden border-b border-white/12">
                  <ResilientImage
                    src={media.imageSrc}
                    alt={media.imageAlt}
                    fallbackTitle={facility.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-2xl font-bold text-white">
                        {facility.name}
                      </h3>
                      <span className="text-base font-bold text-[#E5B842]">
                        {facility.capacity}
                      </span>
                    </div>

                    <dl className="mt-5 divide-y divide-white/10 border-t border-b border-white/10 text-base">
                      <div className="py-3 flex justify-between gap-4">
                        <dt className="text-slate-400 font-medium shrink-0">
                          이용 시간
                        </dt>
                        <dd className="text-white font-semibold text-right tabular-nums">
                          {facility.operatingHours}
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between gap-4">
                        <dt className="text-slate-400 font-medium shrink-0">
                          운영 요일
                        </dt>
                        <dd className="text-white font-semibold text-right">
                          {facility.operatingDays}
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between gap-4">
                        <dt className="text-slate-400 font-medium shrink-0">
                          운영 기준
                        </dt>
                        <dd className="text-[#E5B842] font-bold text-right">
                          {facility.operatingPolicy}
                        </dd>
                      </div>
                      <div className="py-3 flex justify-between gap-4">
                        <dt className="text-slate-400 font-medium shrink-0">
                          사용료
                        </dt>
                        <dd className="text-white font-bold text-right">
                          {facility.feeSummary}
                        </dd>
                      </div>
                    </dl>

                    <ul className="mt-4 space-y-2 text-base text-slate-300">
                      {facility.highlights.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="text-[#E5B842] font-bold mt-0.5"
                          >
                            ·
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => onSelectFacilityForCalc(facility.id)}
                      className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] text-base font-bold transition-colors cursor-pointer"
                    >
                      {facility.shortName} 사용료 계산하기
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Standard Rate Tables */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Auditorium Base Rates */}
          <div className="lg:col-span-5 bg-[#12141B] rounded-xl border border-white/12 p-5 sm:p-6">
            <h3 className="text-xl font-bold text-white">
              공연장 기본 사용료 기준
            </h3>
            <p className="mt-1 text-sm sm:text-base text-slate-400">
              무대 설치 등 사전 사용은 해당 시간대 요금의{' '}
              {PRE_USE_RATE_MULTIPLIER * 100}%가 적용됩니다.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#E5B842] text-sm sm:text-base text-[#E5B842]">
                    <th className="py-2.5 pr-3 font-bold">시간대</th>
                    <th className="py-2.5 px-3 font-bold text-right">평일</th>
                    <th className="py-2.5 pl-3 font-bold text-right">
                      휴일(토·일·공휴일)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-base">
                  {AUDITORIUM_TIME_SLOTS.map((slot) => (
                    <tr key={slot.id}>
                      <td className="py-3.5 pr-3">
                        <div className="font-bold text-white">{slot.label}</div>
                        <div className="text-sm text-slate-400 tabular-nums">
                          {slot.timeRange}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-white tabular-nums whitespace-nowrap">
                        {formatKrw(slot.weekdayFee)}
                      </td>
                      <td className="py-3.5 pl-3 text-right font-bold tabular-nums whitespace-nowrap">
                        {slot.holidayAllowed && slot.holidayFee !== null ? (
                          <span className="text-[#E5B842]">
                            {formatKrw(slot.holidayFee)}
                          </span>
                        ) : (
                          <span className="text-red-400 text-sm sm:text-base">
                            휴일 불가
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              ※ 야간(18:00~22:00) 대관은 평일 기준 주 1회 운영되며 토·일·공휴일에는
              대관할 수 없습니다.
            </p>
          </div>

          {/* Equipment & Utility Rates */}
          <div className="lg:col-span-7 bg-[#12141B] rounded-xl border border-white/12 p-5 sm:p-6">
            <h3 className="text-xl font-bold text-white">
              장비 · 기타 부대시설 요금
            </h3>
            <p className="mt-1 text-sm sm:text-base text-slate-400">
              모든 장비·전기·냉난방 요금은 선택한 시간대(오전·오후·야간) 1회당
              부과됩니다.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 border-t border-white/10">
              {EQUIPMENT_FEES.map((item) => (
                <div
                  key={item.id}
                  className="py-3 border-b border-white/10 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-base font-semibold text-white">
                      {item.name}
                    </span>
                    <span className="ml-2 text-sm text-slate-400">
                      ({item.unitLabel})
                    </span>
                  </div>
                  <span className="text-base font-bold text-[#E5B842] tabular-nums whitespace-nowrap">
                    {formatKrw(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Google Maps & Address Link + Grounding Query Panel */}
        <div className="mt-8 bg-[#12141B] rounded-xl border border-white/12 p-5 sm:p-7 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <p className="text-sm font-bold text-[#E5B842]">
                위치 및 오시는 길 · Google 지도 연동
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#E5B842] shrink-0" aria-hidden="true" />
                <a
                  href={MUSEUM_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E5B842] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{MUSEUM_INFO.address}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 text-[#E5B842]" aria-hidden="true" />
                </a>
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setUseMyLocation((prev) => !prev)}
              aria-pressed={useMyLocation}
              className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border text-sm sm:text-base font-semibold transition-colors cursor-pointer shrink-0 ${
                useMyLocation
                  ? 'bg-[#E5B842] text-[#090A0D] border-[#E5B842]'
                  : 'bg-[#181B24] text-slate-200 border-white/15 hover:border-[#E5B842]'
              }`}
            >
              <Navigation className="w-4 h-4" aria-hidden="true" />
              <span>{useMyLocation ? '내 위치 반영 중' : '내 위치 기준 조회'}</span>
            </button>
          </div>

          <MuseumGoogleMap />

          <div className="pt-4 border-t border-white/10">
            <p className="text-sm sm:text-base font-semibold text-slate-300 mb-3">
              Google Maps 기반 주변 교통 · 주차 · 편의시설 검색
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_MAP_QUERIES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMapQuery(preset.query);
                    fetchMapsInfo(preset.query);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-white/15 bg-[#181B24] hover:border-[#E5B842] text-sm sm:text-base font-semibold text-white transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchMapsInfo(mapQuery);
              }}
              className="mt-4 flex flex-col sm:flex-row gap-3"
            >
              <label htmlFor="maps-query-input" className="sr-only">
                천안박물관 위치 및 주변 교통 질문
              </label>
              <input
                id="maps-query-input"
                type="text"
                value={mapQuery}
                onChange={(e) => setMapQuery(e.target.value)}
                placeholder="예: 천안아산역에서 천안박물관 가는 방법, 주차장 정보"
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl border border-white/15 bg-[#090A0D] text-base text-white placeholder:text-slate-500 focus:border-[#E5B842] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoadingMap}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-2.5 rounded-xl bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] disabled:opacity-60 text-base font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                {isLoadingMap ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>조회 중</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" aria-hidden="true" />
                    <span>지도 정보 조회</span>
                  </>
                )}
              </button>
            </form>

            {mapError && (
              <div
                role="alert"
                className="mt-4 p-4 rounded-xl border border-red-500/40 bg-red-950/40 text-red-100 flex items-start gap-2.5 text-base"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{mapError}</span>
              </div>
            )}

            {mapResult && (
              <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
                <div className="text-base sm:text-lg text-slate-200 leading-relaxed whitespace-pre-line">
                  {mapResult.text}
                </div>

                {mapResult.places.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-base font-bold text-[#E5B842] mb-3">
                      Google Maps 확인 장소 및 바로가기
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mapResult.places.map((place) => (
                        <li
                          key={place.uri}
                          className="p-4 rounded-xl border border-white/12 bg-[#181B24]"
                        >
                          <a
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-base font-bold text-[#E5B842] hover:underline"
                          >
                            <span>{place.title}</span>
                            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                          </a>
                          {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                            <p className="mt-2 text-sm text-slate-300 leading-snug">
                              {place.reviewSnippets[0]}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
