type WeatherCityPreset = {
  id: string
  label: string
  country: string
  timezone: string
  coords: {
    latitude: number
    longitude: number
  }
}

export const WEATHER_CITIES: WeatherCityPreset[] = [
  { id: 'seoul', label: '서울', country: '대한민국', timezone: 'Asia/Seoul', coords: { latitude: 37.5665, longitude: 126.978 } },
  { id: 'tokyo', label: '도쿄', country: '일본', timezone: 'Asia/Tokyo', coords: { latitude: 35.6764, longitude: 139.65 } },
  { id: 'singapore', label: '싱가포르', country: '싱가포르', timezone: 'Asia/Singapore', coords: { latitude: 1.3521, longitude: 103.8198 } },
  { id: 'beijing', label: '베이징', country: '중국', timezone: 'Asia/Shanghai', coords: { latitude: 39.9042, longitude: 116.4074 } },
  { id: 'mumbai', label: '뭄바이', country: '인도', timezone: 'Asia/Kolkata', coords: { latitude: 19.076, longitude: 72.8777 } },
  { id: 'dubai', label: '두바이', country: '아랍에미리트', timezone: 'Asia/Dubai', coords: { latitude: 25.2048, longitude: 55.2708 } },
  { id: 'london', label: '런던', country: '영국', timezone: 'Europe/London', coords: { latitude: 51.5074, longitude: -0.1278 } },
  { id: 'moscow', label: '모스크바', country: '러시아', timezone: 'Europe/Moscow', coords: { latitude: 55.7558, longitude: 37.6173 } },
  { id: 'new-york', label: '뉴욕', country: '미국', timezone: 'America/New_York', coords: { latitude: 40.7128, longitude: -74.006 } },
  { id: 'los-angeles', label: 'LA', country: '미국', timezone: 'America/Los_Angeles', coords: { latitude: 34.0522, longitude: -118.2437 } },
  { id: 'sao-paulo', label: '상파울루', country: '브라질', timezone: 'America/Sao_Paulo', coords: { latitude: -23.5505, longitude: -46.6333 } },
  { id: 'sydney', label: '시드니', country: '호주', timezone: 'Australia/Sydney', coords: { latitude: -33.8688, longitude: 151.2093 } },
  { id: 'cairo', label: '카이로', country: '이집트', timezone: 'Africa/Cairo', coords: { latitude: 30.0444, longitude: 31.2357 } },
]

export const PINNED_CITY_IDS = ['seoul', 'tokyo', 'singapore', 'london', 'new-york', 'sydney'] as const

export const CHART_TABS = [
  { key: 'temp', label: '기온', color: '#f59e0b' },
  { key: 'precip', label: '강수확률', color: '#38bdf8' },
  { key: 'wind', label: '바람', color: '#a3e635' },
] as const
