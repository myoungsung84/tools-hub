import type { WeatherHourly, WeatherHourlyApiResponse } from '@/features/weather/types'

export function mapWeatherHourly(dto: WeatherHourlyApiResponse): WeatherHourly {
  return {
    locationLabel: dto.locationLabel,
    timezone: dto.timezone,
    fetchedAt: new Date(dto.fetchedAt),
    points: dto.points.map(point => ({
      ...point,
      time: new Date(point.time * 1000),
    })),
  }
}
