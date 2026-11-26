import { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react';
import {
  AUDITORIUM_TIME_SLOTS,
  EQUIPMENT_FEES,
  FACILITIES,
  FEE_DISCLAIMER,
  PRE_USE_RATE_MULTIPLIER,
  formatKrw,
  type FacilityId,
  type TimeSlotId,
} from '../data/rentalFees';

interface Step3CalculatorProps {
  facilityId: FacilityId;
  onChangeFacility: (facilityId: FacilityId) => void;
}

function toInputDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDefaultOpenDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toInputDateString(d);
}

function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function Step3Calculator({
  facilityId,
  onChangeFacility,
}: Step3CalculatorProps) {
  const [dateStr, setDateStr] = useState<string>(getDefaultOpenDateString);
  const [isPublicHoliday, setIsPublicHoliday] = useState<boolean>(false);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotId[]>(['afternoon']);
  const [preUseSlots, setPreUseSlots] = useState<TimeSlotId[]>([]);
  const [equipmentQty, setEquipmentQty] = useState<Record<string, number>>({
    wired_mic: 1,
    wireless_mic: 0,
  });

  const parsedDate = useMemo(() => parseLocalDate(dateStr), [dateStr]);
  const dayOfWeek = parsedDate ? parsedDate.getDay() : null;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHolidayRate = isWeekend || isPublicHoliday;

  const formattedDateLabel = useMemo(() => {
    if (!parsedDate || dayOfWeek === null) return '날짜 미선택';
    return `${parsedDate.getFullYear()}년 ${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일 (${WEEKDAY_NAMES[dayOfWeek]}요일)`;
  }, [parsedDate, dayOfWeek]);

  function selectRelativeDay(targetDayOffsetOrWeekday: {
    daysFromToday?: number;
    targetWeekday?: number;
  }) {
    const base = new Date();
    if (typeof targetDayOffsetOrWeekday.daysFromToday === 'number') {
      base.setDate(base.getDate() + targetDayOffsetOrWeekday.daysFromToday);
    } else if (typeof targetDayOffsetOrWeekday.targetWeekday === 'number') {
      const diff =
        (targetDayOffsetOrWeekday.targetWeekday - base.getDay() + 7) % 7 || 7;
      base.setDate(base.getDate() + diff);
    }
    setDateStr(toInputDateString(base));
    if (base.getDay() === 0 || base.getDay() === 6) {
      setSelectedSlots((prev) => prev.filter((id) => id !== 'night'));
      setPreUseSlots((prev) => prev.filter((id) => id !== 'night'));
    }
  }

  function handleDateChange(nextValue: string) {
    setDateStr(nextValue);
    const d = parseLocalDate(nextValue);
    if (d && (d.getDay() === 0 || d.getDay() === 6)) {
      setSelectedSlots((prev) => prev.filter((id) => id !== 'night'));
      setPreUseSlots((prev) => prev.filter((id) => id !== 'night'));
    }
  }

  function handleHolidayToggle(checked: boolean) {
    setIsPublicHoliday(checked);
    if (checked) {
      setSelectedSlots((prev) => prev.filter((id) => id !== 'night'));
      setPreUseSlots((prev) => prev.filter((id) => id !== 'night'));
    }
  }

  function toggleMainSlot(slotId: TimeSlotId) {
    const slotInfo = AUDITORIUM_TIME_SLOTS.find((s) => s.id === slotId);
    if (!slotInfo) return;
    if (isHolidayRate && !slotInfo.holidayAllowed) return;

    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  }

  function togglePreUseSlot(slotId: TimeSlotId) {
    const slotInfo = AUDITORIUM_TIME_SLOTS.find((s) => s.id === slotId);
    if (!slotInfo) return;
    if (isHolidayRate && !slotInfo.holidayAllowed) return;

    setPreUseSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  }

  function toggleEquipment(equipId: string) {
    setEquipmentQty((prev) => ({
      ...prev,
      [equipId]: prev[equipId] ? 0 : 1,
    }));
  }

  function changeCounter(equipId: string, delta: number, max = 12) {
    setEquipmentQty((prev) => {
      const current = prev[equipId] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [equipId]: next };
    });
  }

  function resetCalculator() {
    setDateStr(getDefaultOpenDateString());
    setIsPublicHoliday(false);
    setSelectedSlots(['afternoon']);
    setPreUseSlots([]);
    setEquipmentQty({});
  }

  const calculation = useMemo(() => {
    if (facilityId === 'seminar_room') {
      return {
        slotItems: [] as Array<{ label: string; amount: number }>,
        preUseItems: [] as Array<{ label: string; amount: number }>,
        equipmentItems: [] as Array<{ label: string; detail: string; amount: number }>,
        baseTotal: 0,
        preUseTotal: 0,
        equipmentTotal: 0,
        grandTotal: 0,
        equipmentSessionCount: 0,
      };
    }

    const activeMainSlots = AUDITORIUM_TIME_SLOTS.filter((slot) => {
      if (!selectedSlots.includes(slot.id)) return false;
      if (isHolidayRate && !slot.holidayAllowed) return false;
      return true;
    });

    const activePreSlots = AUDITORIUM_TIME_SLOTS.filter((slot) => {
      if (!preUseSlots.includes(slot.id)) return false;
      if (isHolidayRate && !slot.holidayAllowed) return false;
      return true;
    });

    const slotItems = activeMainSlots.map((slot) => {
      const unitPrice =
        isHolidayRate && slot.holidayFee !== null
          ? slot.holidayFee
          : slot.weekdayFee;
      return {
        label: `${slot.label} (${slot.timeRange}) · ${isHolidayRate ? '휴일' : '평일'}`,
        amount: unitPrice,
      };
    });

    const preUseItems = activePreSlots.map((slot) => {
      const basePrice =
        isHolidayRate && slot.holidayFee !== null
          ? slot.holidayFee
          : slot.weekdayFee;
      return {
        label: `사전 사용 - ${slot.label} (${PRE_USE_RATE_MULTIPLIER * 100}%)`,
        amount: Math.round(basePrice * PRE_USE_RATE_MULTIPLIER),
      };
    });

    const equipmentSessionCount = activeMainSlots.length;
    const equipmentItems = EQUIPMENT_FEES.map((equip) => {
      const qty = equipmentQty[equip.id] || 0;
      if (qty <= 0) return null;
      const sessions = equipmentSessionCount > 0 ? equipmentSessionCount : 0;
      const amount = equip.price * qty * sessions;
      const detail =
        equip.inputType === 'counter'
          ? `${formatKrw(equip.price)} × ${qty}채널 × ${sessions}회`
          : `${formatKrw(equip.price)} × ${sessions}회`;
      return {
        label: equip.name,
        detail,
        amount,
      };
    }).filter((x): x is { label: string; detail: string; amount: number } => x !== null);

    const baseTotal = slotItems.reduce((sum, x) => sum + x.amount, 0);
    const preUseTotal = preUseItems.reduce((sum, x) => sum + x.amount, 0);
    const equipmentTotal = equipmentItems.reduce((sum, x) => sum + x.amount, 0);
    const grandTotal = baseTotal + preUseTotal + equipmentTotal;

    return {
      slotItems,
      preUseItems,
      equipmentItems,
      baseTotal,
      preUseTotal,
      equipmentTotal,
      grandTotal,
      equipmentSessionCount,
    };
  }, [facilityId, selectedSlots, preUseSlots, equipmentQty, isHolidayRate]);

  return (
    <section
      id="step-3-calculator"
      aria-labelledby="step-3-heading"
      className="py-10 sm:py-14 border-b border-white/10 bg-[#0D0F14]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-sm sm:text-base font-bold text-[#E5B842] tracking-wide">
              03. 사용료 계산기
            </p>
            <h2
              id="step-3-heading"
              className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]"
            >
              날짜 · 시간대 · 장비를 선택해 예상 사용료를 확인하세요
            </h2>
          </div>

          <button
            type="button"
            onClick={resetCalculator}
            className="self-start sm:self-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border border-white/15 bg-[#161923] hover:border-[#E5B842] text-sm sm:text-base font-semibold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>초기화</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Controls */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Facility Selector */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                1. 대관 시설 선택
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['auditorium', 'seminar_room'] as FacilityId[]).map((id) => {
                  const fac = FACILITIES[id];
                  const active = facilityId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onChangeFacility(id)}
                      aria-pressed={active}
                      className={`p-4 sm:p-5 rounded-xl border text-left transition-colors cursor-pointer min-h-[76px] ${
                        active
                          ? 'bg-[#191D28] text-white border-[#E5B842]'
                          : 'bg-[#12141B] text-slate-200 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-lg font-bold">{fac.name}</span>
                        {active && (
                          <Check className="w-5 h-5 text-[#E5B842] shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <p
                        className={`mt-1 text-sm sm:text-base ${
                          active ? 'text-[#E5B842]' : 'text-slate-400'
                        }`}
                      >
                        {id === 'auditorium'
                          ? '278석 · 시간대 및 장비 선택'
                          : '10:00~18:00 · 3시간 이내 · 무료'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Date & Holiday Selector */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                2. 대관 희망 날짜 선택
              </h3>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative flex-1">
                  <label htmlFor="rental-date-input" className="sr-only">
                    대관 희망 날짜
                  </label>
                  <div className="flex items-center gap-3 px-4 min-h-[52px] rounded-xl border border-white/15 bg-[#12141B] focus-within:border-[#E5B842]">
                    <Calendar
                      className="w-5 h-5 text-[#E5B842] shrink-0"
                      aria-hidden="true"
                    />
                    <input
                      id="rental-date-input"
                      type="date"
                      value={dateStr}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full py-2 text-lg font-semibold text-white bg-transparent focus:outline-none tabular-nums [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => selectRelativeDay({ targetWeekday: 1 })}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-white/15 bg-[#161923] hover:border-[#E5B842] text-sm font-semibold text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    평일(월)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectRelativeDay({ targetWeekday: 3 })}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-white/15 bg-[#161923] hover:border-[#E5B842] text-sm font-semibold text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    평일(수)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectRelativeDay({ targetWeekday: 6 })}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-white/15 bg-[#161923] hover:border-[#E5B842] text-sm font-semibold text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    주말(토)
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-base font-medium text-slate-300">
                  선택 일자:{' '}
                  <span className="font-bold text-white">
                    {formattedDateLabel}
                  </span>
                  <span className="ml-2 font-bold text-[#E5B842]">
                    ({isHolidayRate ? '휴일 요금 적용' : '평일 요금 적용'})
                  </span>
                </p>

                {!isWeekend && facilityId === 'auditorium' && (
                  <label className="inline-flex items-center gap-2.5 min-h-[44px] px-3.5 py-2 rounded-lg border border-white/15 bg-[#161923] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublicHoliday}
                      onChange={(e) => handleHolidayToggle(e.target.checked)}
                      className="w-5 h-5 accent-[#E5B842] rounded"
                    />
                    <span className="text-sm sm:text-base font-semibold text-white">
                      법정 공휴일입니다
                    </span>
                  </label>
                )}
              </div>
            </div>

            {facilityId === 'seminar_room' ? (
              <div className="pt-6 border-t border-white/10">
                <div className="p-6 rounded-xl border border-white/12 bg-[#12141B]">
                  <h3 className="text-xl font-bold text-white">
                    아카이브 세미나실 이용 안내
                  </h3>
                  <p className="mt-2 text-base sm:text-lg text-slate-200 leading-relaxed">
                    아카이브 세미나실은 10:00 ~ 18:00 운영 시간 내{' '}
                    <strong className="text-[#E5B842]">1회 3시간 이내</strong>로
                    이용 가능하며,{' '}
                    <strong className="text-[#E5B842]">
                      시설 사용료는 무료
                    </strong>
                    입니다.
                  </p>
                  <p className="mt-2 text-sm sm:text-base text-slate-400">
                    ※ 365일 연중 운영(월~일 대관 가능) · 방문 접수(선착순, 1일
                    1단체)를 통해 사전 승인 후 이용할 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 3. Time Slots */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-baseline justify-between gap-2 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      3. 공연장 사용 시간대 선택 (중복 선택 가능)
                    </h3>
                    <span className="text-sm text-[#E5B842] font-semibold">
                      {isHolidayRate ? '휴일 기준' : '평일 기준'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {AUDITORIUM_TIME_SLOTS.map((slot) => {
                      const disabled = isHolidayRate && !slot.holidayAllowed;
                      const selected =
                        !disabled && selectedSlots.includes(slot.id);
                      const price =
                        isHolidayRate && slot.holidayFee !== null
                          ? slot.holidayFee
                          : slot.weekdayFee;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={disabled}
                          aria-pressed={selected}
                          onClick={() => toggleMainSlot(slot.id)}
                          className={`p-4 rounded-xl border text-left transition-colors min-h-[108px] flex flex-col justify-between ${
                            disabled
                              ? 'bg-[#0B0C10] text-slate-600 border-white/5 cursor-not-allowed'
                              : selected
                                ? 'bg-[#E5B842] text-[#090A0D] border-[#E5B842] cursor-pointer'
                                : 'bg-[#12141B] text-white border-white/12 hover:border-[#E5B842] cursor-pointer'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-lg font-bold">
                                {slot.label}
                              </span>
                              {selected && (
                                <Check
                                  className="w-5 h-5 text-[#090A0D] shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <p
                              className={`text-sm mt-0.5 tabular-nums ${
                                disabled
                                  ? 'text-slate-600'
                                  : selected
                                    ? 'text-[#090A0D]/80 font-semibold'
                                    : 'text-slate-400'
                              }`}
                            >
                              {slot.timeRange}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-current/15">
                            {disabled ? (
                              <span className="text-sm font-bold text-red-400">
                                휴일 대관 불가
                              </span>
                            ) : (
                              <span className="text-lg font-bold tabular-nums">
                                {formatKrw(price)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2.5 text-sm text-slate-400">
                    ※ 야간(18:00~22:00)은 평일 주 1회 운영하며 토·일·공휴일은
                    대관이 불가합니다.
                  </p>
                </div>

                {/* 4. Pre-use Setup (50%) */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    4. 무대 설치 등 사전 사용 (선택 사항)
                  </h3>
                  <p className="mt-1 text-sm sm:text-base text-slate-400">
                    무대 설치, 장비 점검, 리허설 등을 위해 별도 시간대를 사전
                    사용하는 경우 해당 시간대 기본 요금의{' '}
                    {PRE_USE_RATE_MULTIPLIER * 100}%가 부과됩니다.
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {AUDITORIUM_TIME_SLOTS.map((slot) => {
                      const disabled = isHolidayRate && !slot.holidayAllowed;
                      const checked =
                        !disabled && preUseSlots.includes(slot.id);
                      const basePrice =
                        isHolidayRate && slot.holidayFee !== null
                          ? slot.holidayFee
                          : slot.weekdayFee;
                      const halfPrice = Math.round(
                        basePrice * PRE_USE_RATE_MULTIPLIER
                      );

                      return (
                        <button
                          key={`pre-${slot.id}`}
                          type="button"
                          disabled={disabled}
                          aria-pressed={checked}
                          onClick={() => togglePreUseSlot(slot.id)}
                          className={`p-3.5 rounded-xl border text-left transition-colors min-h-[68px] flex items-center justify-between gap-3 ${
                            disabled
                              ? 'bg-[#0B0C10] text-slate-600 border-white/5 cursor-not-allowed'
                              : checked
                                ? 'bg-[#1E222E] text-white border-[#E5B842] cursor-pointer'
                                : 'bg-[#12141B] text-white border-white/12 hover:border-[#E5B842] cursor-pointer'
                          }`}
                        >
                          <div>
                            <div className="text-base font-bold">
                              {slot.label} 사전 사용
                            </div>
                            <div
                              className={`text-sm tabular-nums ${
                                disabled
                                  ? 'text-red-400 font-semibold'
                                  : checked
                                    ? 'text-[#E5B842]'
                                    : 'text-slate-400'
                              }`}
                            >
                              {disabled ? '휴일 불가' : `${formatKrw(halfPrice)} (50%)`}
                            </div>
                          </div>
                          {!disabled && (
                            <span
                              className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                                checked
                                  ? 'bg-[#E5B842] text-[#090A0D] border-[#E5B842]'
                                  : 'border-white/25 bg-[#090A0D]'
                              }`}
                            >
                              {checked && <Check className="w-4 h-4" aria-hidden="true" />}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Equipment & Utilities */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      5. 장비 · 기타 부대시설 선택
                    </h3>
                    <span className="text-sm font-semibold text-[#E5B842]">
                      본 행사 선택 시간대 기준 ({calculation.equipmentSessionCount}
                      회 적용)
                    </span>
                  </div>

                  {calculation.equipmentSessionCount === 0 && (
                    <p className="mb-3 text-sm sm:text-base font-semibold text-amber-200 bg-amber-950/50 border border-amber-500/40 rounded-lg px-4 py-2.5">
                      공연장 사용 시간대(오전·오후·야간)를 1개 이상 선택하면 장비
                      사용료가 합산됩니다.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EQUIPMENT_FEES.map((item) => {
                      const qty = equipmentQty[item.id] || 0;
                      const isSelected = qty > 0;

                      if (item.inputType === 'counter') {
                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'border-[#E5B842] bg-[#191D28]'
                                : 'border-white/10 bg-[#12141B]'
                            }`}
                          >
                            <div>
                              <div className="text-base sm:text-lg font-bold text-white">
                                {item.name}
                              </div>
                              <div className="text-sm text-slate-400 tabular-nums">
                                {formatKrw(item.price)} / {item.unitLabel}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                aria-label={`${item.name} 수량 감소`}
                                onClick={() =>
                                  changeCounter(
                                    item.id,
                                    -1,
                                    item.maxQuantity || 12
                                  )
                                }
                                disabled={qty <= 0}
                                className="w-11 h-11 rounded-lg border border-white/20 bg-[#090A0D] hover:border-[#E5B842] disabled:opacity-35 flex items-center justify-center text-white cursor-pointer"
                              >
                                <Minus className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <span
                                aria-live="polite"
                                className="w-10 text-center text-lg font-bold text-[#E5B842] tabular-nums"
                              >
                                {qty}
                              </span>
                              <button
                                type="button"
                                aria-label={`${item.name} 수량 증가`}
                                onClick={() =>
                                  changeCounter(
                                    item.id,
                                    1,
                                    item.maxQuantity || 12
                                  )
                                }
                                disabled={qty >= (item.maxQuantity || 12)}
                                className="w-11 h-11 rounded-lg border border-white/20 bg-[#090A0D] hover:border-[#E5B842] disabled:opacity-35 flex items-center justify-center text-white cursor-pointer"
                              >
                                <Plus className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleEquipment(item.id)}
                          className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors min-h-[68px] cursor-pointer ${
                            isSelected
                              ? 'border-[#E5B842] bg-[#191D28] text-white'
                              : 'border-white/10 bg-[#12141B] text-white hover:border-white/30'
                          }`}
                        >
                          <div>
                            <div className="text-base sm:text-lg font-bold">
                              {item.name}
                            </div>
                            <div className="text-sm text-slate-400 tabular-nums">
                              {formatKrw(item.price)} / {item.unitLabel}
                            </div>
                          </div>
                          <span
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#E5B842] text-[#090A0D] border-[#E5B842]'
                                : 'bg-[#090A0D] border-white/25'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4" aria-hidden="true" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Itemized Summary Receipt */}
          <aside
            aria-label="예상 사용료 산출 내역"
            className="lg:col-span-5 lg:sticky lg:top-24 rounded-xl border border-[#E5B842]/45 bg-[#12141B] p-5 sm:p-7"
          >
            <div className="pb-4 border-b border-white/12">
              <p className="text-sm font-bold text-[#E5B842]">
                항목별 산출 내역
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white">
                {FACILITIES[facilityId].name}
              </h3>
              <p className="mt-1 text-base text-slate-300">
                {formattedDateLabel}
              </p>
            </div>

            {facilityId === 'seminar_room' ? (
              <div className="py-6 space-y-4">
                <div className="flex items-center justify-between text-base py-2 border-b border-white/10">
                  <span className="text-slate-300">
                    아카이브 세미나실 (10:00~18:00, 3시간 이내)
                  </span>
                  <span className="font-bold text-[#E5B842] tabular-nums">
                    0원 (무료)
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-5 space-y-5">
                {/* Base slots */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 mb-2">
                    기본 대관료
                  </h4>
                  {calculation.slotItems.length === 0 ? (
                    <p className="text-base text-slate-400">
                      선택된 시간대가 없습니다.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-base">
                      {calculation.slotItems.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-baseline justify-between gap-4"
                        >
                          <span className="text-slate-200">{item.label}</span>
                          <span className="font-bold text-white tabular-nums shrink-0">
                            {formatKrw(item.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Pre-use setup */}
                {calculation.preUseItems.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-bold text-slate-400 mb-2">
                      사전 사용료 (무대 설치 등 50%)
                    </h4>
                    <ul className="space-y-2 text-base">
                      {calculation.preUseItems.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-baseline justify-between gap-4"
                        >
                          <span className="text-slate-200">{item.label}</span>
                          <span className="font-bold text-white tabular-nums shrink-0">
                            {formatKrw(item.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Equipment */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold text-slate-400 mb-2">
                    장비 · 기타 사용료 (시간대 1회당 부과)
                  </h4>
                  {calculation.equipmentItems.length === 0 ? (
                    <p className="text-base text-slate-400">
                      선택된 장비가 없습니다.
                    </p>
                  ) : (
                    <ul className="space-y-2.5 text-base">
                      {calculation.equipmentItems.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-baseline justify-between gap-4"
                        >
                          <div>
                            <span className="text-slate-100 font-medium">
                              {item.label}
                            </span>
                            <span className="block text-xs sm:text-sm text-slate-400 tabular-nums">
                              {item.detail}
                            </span>
                          </div>
                          <span className="font-bold text-white tabular-nums shrink-0">
                            {formatKrw(item.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Total & Required Fixed Disclaimer */}
            <div className="pt-5 border-t-2 border-[#E5B842]">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-lg font-bold text-white">
                  예상 합계 금액
                </span>
                <span className="text-3xl font-bold text-[#E5B842] tabular-nums">
                  {formatKrw(calculation.grandTotal)}
                </span>
              </div>

              <p className="mt-3 p-3.5 rounded-lg bg-[#090A0D] border border-white/12 text-sm sm:text-base font-semibold text-slate-200 leading-snug">
                {FEE_DISCLAIMER}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
