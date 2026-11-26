import type { FacilityId } from './rentalFees';

export const HERO_MUSEUM_IMAGE = '/assets/aistudio/_________9d76d600.jpg';

export interface HeroSlide {
  src: string;
  alt: string;
  label: string;
}

export const HERO_MUSEUM_SLIDES: HeroSlide[] = [
  {
    src: '/assets/aistudio/_________9d76d600.jpg',
    alt: '천안박물관 외관 전경',
    label: '천안박물관 외관 전경',
  },
  {
    src: '/assets/aistudio/_______2_f58bbedc.jpg',
    alt: '천안박물관 로비 및 안내데스크',
    label: '로비 · 안내데스크',
  },
  {
    src: '/assets/aistudio/_______3_73e77040.jpeg',
    alt: '천안박물관 중앙 홀 및 휴게 라운지',
    label: '중앙 홀 · 휴게 라운지',
  },
  {
    src: '/assets/aistudio/_______4_cbd92fc0.jpeg',
    alt: '천안박물관 어린이박물관 입구',
    label: '어린이박물관',
  },
  {
    src: '/assets/aistudio/_______5_6c81e8fa.jpeg',
    alt: '천안박물관 전시실 내부 전경',
    label: '전시실 내부',
  },
];

export const FACILITY_MEDIA: Record<
  FacilityId,
  { imageSrc: string; imageAlt: string; caption: string }
> = {
  auditorium: {
    imageSrc: '/src/assets/images/museum_auditorium_hall_1795668653624.jpg',
    imageAlt: '천안박물관 공연장 내부 전경 (278석 규모 관람석과 무대)',
    caption: '천안박물관 공연장 · 총 278석',
  },
  seminar_room: {
    imageSrc: '/assets/aistudio/______b7bea9c6.jpg',
    imageAlt: '천안박물관 아카이브 세미나실 내부 전경',
    caption: '아카이브 세미나실 · 1회 3시간 이내 무료',
  },
};
