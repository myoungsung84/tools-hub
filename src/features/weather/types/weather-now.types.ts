export type WeatherNowBase = {
  tempC: number
  feelsLikeC?: number
  windMs?: number
  code?: number
  label: string
  locationLabel: string
}

export type WeatherNowApiResponse = WeatherNowBase & {
  fetchedAt: string
}

export type WeatherNowManyItemApi = WeatherNowBase

export type WeatherNowManyApiResponse = {
  fetchedAt: string
  items: Record<string, WeatherNowManyItemApi>
}

export type WeatherNow = WeatherNowBase & {
  fetchedAt: Date
}

export type WeatherNowMany = Record<string, WeatherNow>

export type Coords = { latitude: number; longitude: number }

export type WeatherNowManyLocationInput = {
  id: string
  label: string
  latitude: number
  longitude: number
  timezone: string
}
