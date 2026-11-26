export type PurposeId = 'performance' | 'lecture' | 'seminar';
export type FacilityId = 'auditorium' | 'seminar_room';
export type TimeSlotId = 'morning' | 'afternoon' | 'night';

export interface PurposeOption {
  id: PurposeId;
  label: string;
  headline: string;
  description: string;
  recommendedFacility: FacilityId;
  recommendedFacilityName: string;
  eligibilityNote: string;
  examples: string[];
}

export interface FacilitySpec {
  id: FacilityId;
  name: string;
  shortName: string;
  capacity: string;
  operatingHours: string;
  operatingDays: string;
  operatingPolicy: string;
  feeSummary: string;
  highlights: string[];
}

export interface TimeSlotRate {
  id: TimeSlotId;
  label: string;
  timeRange: string;
  weekdayFee: number;
  holidayFee: number | null;
  holidayAllowed: boolean;
  note?: string;
}

export interface EquipmentRate {
  id: string;
  name: string;
  category: '음향·영상' | '무대·악기' | '전기·냉난방';
  price: number;
  unitLabel: string;
  inputType: 'toggle' | 'counter';
  maxQuantity?: number;
  note?: string;
}

export interface ProcessStep {
  stepNumber: string;
  title: string;
  summary: string;
  detail: string;
}

export interface RequiredDocument {
  id: string;
  title: string;
  condition: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const MUSEUM_INFO = {
  name: '천안박물관',
  department: '천안박물관 관리팀',
  phone: '041-521-2884',
  phoneHref: 'tel:041-521-2884',
  address: '충청남도 천안시 동남구 천안대로 429-13 (삼룡동)',
  operatingPolicyName: '365일 연중 운영 (월요일 포함 전 요일 대관 가능)',
  coordinates: {
    latitude: 36.7867,
    longitude: 127.1852,
  },
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=%EC%B6%A9%EC%B2%AD%EB%82%A8%EB%8F%84+%EC%B2%9C%EC%95%88%EC%8B%9C+%EB%8F%99%EB%82%A8%EA%B5%AC+%EC%B2%9C%EC%95%88%EB%8C%80%EB%A1%9C+429-13+%EC%B2%9C%EC%95%88%EB%B0%95%EB%AC%BC%EA%B4%80',
  googleMapsDirectionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=36.7867,127.1852',
} as const;

export const FEE_DISCLAIMER =
  '예상 금액이며, 최종 사용료는 사용허가 시 확정됩니다.';

export const RESTRICTED_PURPOSE_NOTICE =
  '회의·토론, 정치·종교·상행위는 공연장 대관이 불가합니다.';

export const RESTRICTED_PURPOSES: Array<{ title: string; detail: string }> = [
  {
    title: '회의·토론 행사',
    detail: '일반 기관·단체의 내부 회의, 간담회, 토론회 목적은 공연장 대관이 제한됩니다.',
  },
  {
    title: '정치적 목적 행사',
    detail: '정당 활동, 선거 관련 집회, 특정 정치인·정치 단체의 홍보는 불가합니다.',
  },
  {
    title: '종교적 목적 행사',
    detail: '특정 종교의 포교, 예배, 부흥회 등 종교 의식 관련 대관은 불가합니다.',
  },
  {
    title: '영리·상행위',
    detail: '물품 판매, 유료 판촉, 상업적 홍보 및 수익 사업 목적 행사는 불가합니다.',
  },
];

export const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    id: 'performance',
    label: '공연',
    headline: '음악회·연주회·무용·연극 등 문화예술 공연',
    description:
      '278석 규모의 천안박물관 공연장에서 음향·조명·피아노 등 무대 장비를 활용한 문화예술 공연을 진행할 수 있습니다.',
    recommendedFacility: 'auditorium',
    recommendedFacilityName: '천안박물관 공연장 (278석)',
    eligibilityNote: '무대 설치·리허설 등 사전 사용 시 해당 시간대 요금의 50%가 적용됩니다.',
    examples: ['클래식·국악·합창 연주회', '어린이·청소년 문화예술 발표회', '무용·연극·창작 공연'],
  },
  {
    id: 'lecture',
    label: '강연',
    headline: '인문학 특강·학술 강연·시민 공개 강좌',
    description:
      '대규모 청중을 대상으로 하는 공익적 강연 및 교육 프로그램에 적합하며, 빔프로젝터와 스크린, 마이크 장비를 선택해 이용할 수 있습니다.',
    recommendedFacility: 'auditorium',
    recommendedFacilityName: '천안박물관 공연장 (278석)',
    eligibilityNote: '단순 회의·토론이나 영리 목적 설명회는 대관 대상에서 제외됩니다.',
    examples: ['역사·문화 시민 공개 특강', '교육청·공공기관 초청 강연', '학술 심포지엄 발표 강연'],
  },
  {
    id: 'seminar',
    label: '소규모 세미나',
    headline: '역사·문화 연구 모임 및 소규모 학술 세미나',
    description:
      '아카이브 세미나실을 1회 3시간 이내로 무료 이용할 수 있으며, 규모가 크거나 무대 장비가 필요한 경우 공연장 선택도 가능합니다.',
    recommendedFacility: 'seminar_room',
    recommendedFacilityName: '아카이브 세미나실 (무료 · 3시간 이내)',
    eligibilityNote: '아카이브 세미나실은 10:00~18:00 운영되며 대관료가 무료입니다.',
    examples: ['학술 연구 자료 열람·세미나', '지역 문화·박물관 연계 소규모 워크숍', '비영리 교육 분과 모임'],
  },
];

export const FACILITIES: Record<FacilityId, FacilitySpec> = {
  auditorium: {
    id: 'auditorium',
    name: '천안박물관 공연장',
    shortName: '공연장 (278석)',
    capacity: '278석',
    operatingHours: '09:00 ~ 22:00 (오전·오후·야간)',
    operatingDays: '365일 연중 운영 (월~일요일 · 1일 1단체)',
    operatingPolicy: '월요일 포함 전 요일 대관 가능',
    feeSummary: '시간대별 기본료 50,000원 ~ 80,000원 (장비·부대시설 별도)',
    highlights: [
      '총 278석 계단식 관람석 및 무대 공간',
      '유선·무선 마이크, 음향재생기, 조명, 빔프로젝터, 피아노 등 장비 선택 가능',
      '야간(18:00~22:00)은 평일 주 1회 운영, 토·일·공휴일 야간 대관 불가',
    ],
  },
  seminar_room: {
    id: 'seminar_room',
    name: '아카이브 세미나실',
    shortName: '아카이브 세미나실 (무료)',
    capacity: '소규모 세미나 적합',
    operatingHours: '10:00 ~ 18:00 (1회 3시간 이내)',
    operatingDays: '365일 연중 운영 (월~일요일)',
    operatingPolicy: '월요일 포함 전 요일 대관 가능',
    feeSummary: '사용료 무료',
    highlights: [
      '10:00 ~ 18:00 운영 시간 중 1회 최대 3시간 이내 이용 가능',
      '별도 시설 사용료 없이 무료 대관 (사전 방문 접수 필수)',
      '리모델링으로 신설된 2층 아카이브 연계 소규모 학술·교육 모임에 적합',
    ],
  },
};

/**
 * 공연장 시간대별 기본 사용료 (단위: 원)
 * 숫자만 수정하면 사용료 계산기와 요금표, AI 안내에 즉시 반영됩니다.
 */
export const AUDITORIUM_TIME_SLOTS: TimeSlotRate[] = [
  {
    id: 'morning',
    label: '오전',
    timeRange: '09:00 ~ 13:00',
    weekdayFee: 50000,
    holidayFee: 60000,
    holidayAllowed: true,
  },
  {
    id: 'afternoon',
    label: '오후',
    timeRange: '13:00 ~ 18:00',
    weekdayFee: 60000,
    holidayFee: 70000,
    holidayAllowed: true,
  },
  {
    id: 'night',
    label: '야간',
    timeRange: '18:00 ~ 22:00',
    weekdayFee: 80000,
    holidayFee: null,
    holidayAllowed: false,
    note: '휴일(토·일·공휴일) 불가 · 야간 대관은 주 1회 운영',
  },
];

/**
 * 무대 설치 등 사전 사용 요금 비율 (해당 시간대 기본 요금의 50%)
 */
export const PRE_USE_RATE_MULTIPLIER = 0.5;

/**
 * 장비·기타 부대시설 사용료 (단위: 원, 시간대 1회당 부과)
 * 숫자만 수정하면 계산기와 요금 안내표에 즉시 반영됩니다.
 */
export const EQUIPMENT_FEES: EquipmentRate[] = [
  {
    id: 'audio_player',
    name: '음향재생기',
    category: '음향·영상',
    price: 5000,
    unitLabel: '1대 / 1회',
    inputType: 'toggle',
  },
  {
    id: 'wired_mic',
    name: '유선마이크',
    category: '음향·영상',
    price: 5000,
    unitLabel: '채널 / 1회',
    inputType: 'counter',
    maxQuantity: 12,
    note: '필요한 채널 수만큼 선택',
  },
  {
    id: 'wireless_mic',
    name: '무선마이크',
    category: '음향·영상',
    price: 10000,
    unitLabel: '채널 / 1회',
    inputType: 'counter',
    maxQuantity: 12,
    note: '필요한 채널 수만큼 선택',
  },
  {
    id: 'projector',
    name: '빔프로젝터',
    category: '음향·영상',
    price: 20000,
    unitLabel: '1대 / 1회',
    inputType: 'toggle',
  },
  {
    id: 'screen',
    name: '스크린',
    category: '음향·영상',
    price: 5000,
    unitLabel: '1식 / 1회',
    inputType: 'toggle',
  },
  {
    id: 'lighting',
    name: '조명',
    category: '무대·악기',
    price: 20000,
    unitLabel: '1식 / 1회',
    inputType: 'toggle',
  },
  {
    id: 'piano',
    name: '피아노',
    category: '무대·악기',
    price: 30000,
    unitLabel: '1대 / 1회',
    inputType: 'toggle',
  },
  {
    id: 'electricity',
    name: '전기',
    category: '전기·냉난방',
    price: 40000,
    unitLabel: '1식 / 1회',
    inputType: 'toggle',
  },
  {
    id: 'hvac',
    name: '냉·난방',
    category: '전기·냉난방',
    price: 50000,
    unitLabel: '1식 / 1회',
    inputType: 'toggle',
  },
];

export const RENTAL_STEPS: ProcessStep[] = [
  {
    stepNumber: '01',
    title: '신청서 작성',
    summary: '대관 목적 및 일정 확정 후 서류 작성',
    detail:
      '희망 대관 일정(365일 연중 대관 가능)과 목적 적합 여부를 확인한 뒤, 대관허가 신청서와 개인정보 동의서를 작성합니다.',
  },
  {
    stepNumber: '02',
    title: '방문 접수',
    summary: '선착순 접수 · 1일 1단체 원칙',
    detail:
      '천안박물관 관리팀에 직접 방문하여 서류를 제출합니다. 접수 순서에 따라 선착순으로 배정되며 1일 1단체만 대관합니다.',
  },
  {
    stepNumber: '03',
    title: '심사',
    summary: '행사 목적 및 운영 적합성 검토',
    detail:
      '박물관 설립 취지 및 대관 규정(회의·토론, 정치·종교·상행위 제한 등)에 부합하는지 담당 부서에서 심사합니다.',
  },
  {
    stepNumber: '04',
    title: '승인',
    summary: '사용허가 및 최종 사용료 통보',
    detail:
      '심사 통과 시 대관 사용허가와 함께 장비·냉난방 등을 포함한 최종 확정 사용료 및 납부 안내를 받습니다.',
  },
  {
    stepNumber: '05',
    title: '대관료 완납 시 확정',
    summary: '사용료 납부 완료 후 일정 최종 확정',
    detail:
      '안내된 기한 내에 대관료 전액을 완납하면 시설 대관 예약이 최종 확정됩니다. (아카이브 세미나실은 승인 시 무료 확정)',
  },
];

export const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  {
    id: 'application',
    title: '대관허가 신청서',
    condition: '필수 제출',
    description: '행사명, 사용 일시, 인원, 사용 시설 및 장비 내역을 기재하여 제출합니다.',
  },
  {
    id: 'privacy_consent',
    title: '개인정보 동의서',
    condition: '필수 제출',
    description: '방문 접수 시 신청자 확인 및 행정 처리를 위해 서면으로 함께 제출합니다.',
  },
  {
    id: 'discount_proof',
    title: '감면 증빙서류',
    condition: '해당 시 제출',
    description: '관련 조례에 따른 사용료 감면 대상 단체·행사인 경우 증빙 서류를 지참합니다.',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-monday',
    question: '월요일에도 시설 대관이 가능한가요?',
    answer:
      '네, 가능합니다. 365일 연중 운영 체제 변경에 따라 월요일을 포함한 모든 요일(월~일)에 공연장과 아카이브 세미나실 모두 대관이 가능합니다. 평일(월~금) 기준 요금이 적용됩니다.',
  },
  {
    id: 'faq-restricted',
    question: '어떤 행사가 공연장 대관 불가 대상인가요?',
    answer:
      '공공 박물관 시설 운영 목적에 따라 일반 회의·토론, 정치적 행사(정당·선거 관련), 종교적 행사(예배·포교 등), 상업적 영리·판촉 행위는 공연장 대관이 불가합니다.',
  },
  {
    id: 'faq-night',
    question: '주말이나 공휴일 야간 시간대도 대관할 수 있나요?',
    answer:
      '아니요. 공연장 야간(18:00~22:00) 시간대는 토요일·일요일·공휴일에는 대관이 불가하며, 평일(월~금) 기준 주 1회만 운영됩니다.',
  },
  {
    id: 'faq-preuse',
    question: '공연 전날이나 오전 시간에 무대 설치·리허설만 먼저 할 수 있나요?',
    answer:
      '가능합니다. 무대 설치·장비 세팅·리허설 등 본 행사 전 사전 사용이 필요한 경우 해당 시간대 기본 사용료의 50% 요금이 적용됩니다.',
  },
  {
    id: 'faq-equipment',
    question: '마이크나 냉·난방 요금은 하루 기준인가요, 시간대 기준인가요?',
    answer:
      '음향재생기, 유·무선마이크, 조명, 빔프로젝터, 스크린, 피아노, 전기, 냉·난방 요금은 모두 선택한 시간대(오전·오후·야간) 1회당 부과됩니다. 예를 들어 오전과 오후 2개 시간대를 이용하면 시간대 2회 기준으로 산정됩니다.',
  },
  {
    id: 'faq-seminar',
    question: '아카이브 세미나실은 정말 무료인가요? 이용 조건이 궁금합니다.',
    answer:
      '네, 아카이브 세미나실은 사용료가 무료입니다. 연중(월~일) 10:00~18:00 사이에 1회 최대 3시간 이내로 이용할 수 있으며, 공연장과 동일하게 방문 접수를 통해 사전 허가를 받아야 합니다.',
  },
  {
    id: 'faq-booking',
    question: '온라인으로 바로 신청서를 제출할 수 있나요?',
    answer:
      '본 웹앱은 대관 안내 및 예상 사용료 계산 전용이며 별도의 개인정보 입력이나 온라인 접수를 받지 않습니다. 대관 가능 일정은 관리팀(041-521-2884)으로 먼저 확인하신 후, 구비서류를 지참해 방문 접수(선착순 · 1일 1단체)해 주세요.',
  },
];

export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function buildFeeSummaryForPrompt(): string {
  const slotLines = AUDITORIUM_TIME_SLOTS.map((slot) => {
    const holidayText =
      slot.holidayAllowed && slot.holidayFee !== null
        ? `${formatKrw(slot.holidayFee)}`
        : '휴일 불가';
    return `- ${slot.label}(${slot.timeRange}): 평일 ${formatKrw(slot.weekdayFee)} / 휴일(토·일·공휴일) ${holidayText}${slot.note ? ` [${slot.note}]` : ''}`;
  }).join('\n');

  const equipLines = EQUIPMENT_FEES.map(
    (item) => `- ${item.name}: ${formatKrw(item.price)} (${item.unitLabel})`
  ).join('\n');

  return `
[천안박물관 시설 대관 공식 기준]
1. 기관 및 문의: ${MUSEUM_INFO.department}, 전화 ${MUSEUM_INFO.phone}, 위치 ${MUSEUM_INFO.address}
2. 운영 기준: ${MUSEUM_INFO.operatingPolicyName} (월요일도 평일 대관 가능)
3. 목적 제한: ${RESTRICTED_PURPOSE_NOTICE} (가능 목적: 공연, 강연, 소규모 세미나)
4. 시설 정보:
   - 천안박물관 공연장: 278석, 09:00~22:00, 365일 연중 운영(월~일)
   - 아카이브 세미나실: 10:00~18:00, 1회 3시간 이내, 무료, 365일 연중 운영(월~일)
5. 공연장 기본 사용료:
${slotLines}
6. 무대 설치 등 사전 사용: 해당 시간대 기본 요금의 ${PRE_USE_RATE_MULTIPLIER * 100}%
7. 장비·기타 요금 (시간대 1회당 부과):
${equipLines}
8. 신청 절차: 신청서 작성 → 방문 접수(선착순, 1일 1단체) → 심사 → 승인 → 대관료 완납 시 확정
9. 준비서류: 대관허가 신청서, 개인정보 동의서, (해당 시) 감면 증빙서류
10. 필수 고지: 계산된 금액은 "${FEE_DISCLAIMER}"
`.trim();
}
