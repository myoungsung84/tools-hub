export type WeatherHourlyPointApi = {
  time: string
  temperature: number
  code?: number
  condition: string
  precipitationProbability?: number
  windSpeed?: number
}

export type WeatherHourlyApiResponse = {
  locationLabel: string
  timezone: string
  fetchedAt: string
  points: WeatherHourlyPointApi[]
}

export type WeatherHourlyPoint = Omit<WeatherHourlyPointApi, 'time'> & {
  time: Date
}

export type WeatherHourly = Omit<WeatherHourlyApiResponse, 'fetchedAt' | 'points'> & {
  fetchedAt: Date
  points: WeatherHourlyPoint[]
}
