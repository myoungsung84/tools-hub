import type { WeatherNow, WeatherNowApiResponse } from '@/features/time/types/weather-now.types'

export function mapWeatherNow(dto: WeatherNowApiResponse): WeatherNow {
  return {
    tempC: dto.tempC,
    feelsLikeC: dto.feelsLikeC,
    windMs: dto.windMs,
    code: dto.code,
    label: dto.label,
    fetchedAt: new Date(dto.fetchedAt),
    locationLabel: dto.locationLabel,
  }
}
