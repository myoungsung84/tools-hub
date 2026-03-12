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

export type WeatherNow = WeatherNowBase & {
  fetchedAt: Date
}

export type Coords = { latitude: number; longitude: number }
