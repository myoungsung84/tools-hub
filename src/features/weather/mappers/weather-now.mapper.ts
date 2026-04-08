import type { WeatherNow, WeatherNowApiResponse, WeatherNowMany, WeatherNowManyApiResponse } from '@/features/weather/types'

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

export function mapWeatherNowMany(dto: WeatherNowManyApiResponse): WeatherNowMany {
  return Object.fromEntries(
    Object.entries(dto.items).map(([id, item]) => [
      id,
      {
        tempC: item.tempC,
        feelsLikeC: item.feelsLikeC,
        windMs: item.windMs,
        code: item.code,
        label: item.label,
        fetchedAt: new Date(dto.fetchedAt),
        locationLabel: item.locationLabel,
      },
    ])
  )
}
