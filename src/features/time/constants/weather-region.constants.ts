import type { Coords } from '@/features/time/types/weather-now.types'

export const WEATHER_REGION = {
  SEOUL: 'SEOUL',
  BUSAN: 'BUSAN',
  INCHEON: 'INCHEON',
  DAEGU: 'DAEGU',
  GWANGJU: 'GWANGJU',
  DAEJEON: 'DAEJEON',
  ULSAN: 'ULSAN',
  SEJONG: 'SEJONG',
  SUWON: 'SUWON',
  GANGNEUNG: 'GANGNEUNG',
  JEONJU: 'JEONJU',
  CHANGWON: 'CHANGWON',
  JEJU: 'JEJU',
} as const

export type WeatherRegion = keyof typeof WEATHER_REGION

export const REGION_CONFIG: Record<
  WeatherRegion,
  {
    label: string
    timezone: string
    coords: Coords
  }
> = {
  SEOUL: {
    label: '서울',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.5665, longitude: 126.978 },
  },
  BUSAN: {
    label: '부산',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.1796, longitude: 129.0756 },
  },
  INCHEON: {
    label: '인천',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.4563, longitude: 126.7052 },
  },
  DAEGU: {
    label: '대구',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.8722, longitude: 128.6025 },
  },
  GWANGJU: {
    label: '광주',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.1595, longitude: 126.8526 },
  },
  DAEJEON: {
    label: '대전',
    timezone: 'Asia/Seoul',
    coords: { latitude: 36.3504, longitude: 127.3845 },
  },
  ULSAN: {
    label: '울산',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.5384, longitude: 129.3114 },
  },
  SEJONG: {
    label: '세종',
    timezone: 'Asia/Seoul',
    coords: { latitude: 36.48, longitude: 127.289 },
  },
  SUWON: {
    label: '수원',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.2636, longitude: 127.0286 },
  },
  GANGNEUNG: {
    label: '강릉',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.7519, longitude: 128.8761 },
  },
  JEONJU: {
    label: '전주',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.8242, longitude: 127.148 },
  },
  CHANGWON: {
    label: '창원',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.2279, longitude: 128.6811 },
  },
  JEJU: {
    label: '제주',
    timezone: 'Asia/Seoul',
    coords: { latitude: 33.4996, longitude: 126.5312 },
  },
}
