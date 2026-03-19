'use client'

import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { CHART_TABS } from '@/features/weather/constants'
import { formatChartTime } from '@/features/weather/lib'
import type { WeatherHourlyPoint } from '@/features/weather/types'
import { cn } from '@/lib/shared'

export type WeatherChartTab = (typeof CHART_TABS)[number]['key']

interface CustomDotProps {
  cx?: number
  cy?: number
  value?: number | [number, number]
  index?: number
  color: string
  unit: string
  total: number
  peakIndex: number
}

function CustomDotWithLabel({
  cx = 0,
  cy = 0,
  value,
  index = 0,
  color,
  unit,
  total,
  peakIndex,
}: CustomDotProps) {
  if (value == null) return null
  const displayValue = Array.isArray(value) ? value[1] : value
  if (displayValue == null) return null

  const isFirst = index === 0
  const isLast = index === total - 1
  const isPeak = index === peakIndex
  const showLabel = isFirst || isLast || isPeak
  const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle'

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={showLabel ? 3.5 : 2}
        fill={color}
        fillOpacity={showLabel ? 1 : 0.35}
      />
      {showLabel && (
        <text
          x={cx}
          y={cy - 8}
          textAnchor={anchor}
          fill='rgba(255,255,255,0.85)'
          fontSize={10}
          fontWeight={600}
        >
          {displayValue}
          {unit}
        </text>
      )}
    </g>
  )
}

type HourlyForecastPanelProps = {
  isLoading: boolean
  mainHourlyLoading: boolean
  hourlyItems: WeatherHourlyPoint[]
  timezone: string
  chartTab: WeatherChartTab
  onChangeChartTab: (tab: WeatherChartTab) => void
}

export function WeatherHourlyPanel({
  isLoading,
  mainHourlyLoading,
  hourlyItems,
  timezone,
  chartTab,
  onChangeChartTab,
}: HourlyForecastPanelProps) {
  const chartData = useMemo(
    () =>
      hourlyItems.map(point => ({
        time: formatChartTime(point.time, timezone),
        temp: point.temperature,
        precip: point.precipitationProbability ?? 0,
        wind: point.windSpeed ?? 0,
      })),
    [hourlyItems, timezone]
  )

  const peakIndex = useMemo(() => {
    const key = chartTab as 'temp' | 'precip' | 'wind'
    let maxVal = -Infinity
    let maxIdx = 0
    chartData.forEach((d, i) => {
      if (d[key] > maxVal) {
        maxVal = d[key]
        maxIdx = i
      }
    })
    return maxIdx
  }, [chartData, chartTab])

  const showSkeleton = isLoading || mainHourlyLoading || hourlyItems.length === 0

  return (
    <div className='px-5 pb-5 pt-4' data-testid='weather-hourly-panel'>
      <div className='mb-3 flex items-center justify-between'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30'>
          시간별 예보
        </p>
        <div className='flex items-center gap-1'>
          {CHART_TABS.map(tab => {
            const isActive = chartTab === tab.key
            return (
              <button
                key={tab.key}
                type='button'
                onClick={() => onChangeChartTab(tab.key)}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all duration-150 active:scale-95',
                  isActive
                    ? 'bg-white/10 text-white/90'
                    : 'text-white/30 hover:bg-white/5 hover:text-white/60'
                )}
              >
                <span
                  className='h-1.5 w-1.5 rounded-full'
                  style={{ background: tab.color, opacity: isActive ? 1 : 0.35 }}
                />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {showSkeleton ? (
        <div className='flex h-[160px] animate-pulse items-end gap-1 rounded-xl bg-white/4 px-4 pb-4 pt-6'>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className='flex-1 rounded-sm bg-white/8'
              style={{ height: `${30 + Math.sin(i * 0.8) * 20 + 20}%` }}
            />
          ))}
        </div>
      ) : (
        <ResponsiveContainer width='100%' height={160}>
          <AreaChart data={chartData} margin={{ top: 24, right: 16, left: 16, bottom: 0 }}>
            <defs>
              <linearGradient id='gradTemp' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='rgba(245,158,11,0.35)' />
                <stop offset='100%' stopColor='rgba(245,158,11,0)' />
              </linearGradient>
              <linearGradient id='gradPrecip' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='rgba(56,189,248,0.35)' />
                <stop offset='100%' stopColor='rgba(56,189,248,0)' />
              </linearGradient>
              <linearGradient id='gradWind' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='rgba(163,230,53,0.35)' />
                <stop offset='100%' stopColor='rgba(163,230,53,0)' />
              </linearGradient>
            </defs>

            <XAxis
              dataKey='time'
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={1}
            />
            <YAxis yAxisId='temp' domain={['dataMin - 1', 'dataMax + 10']} hide />
            <YAxis yAxisId='precip' domain={[0, 150]} hide />
            <YAxis yAxisId='wind' domain={[0, 'dataMax + 6']} hide />

            <Tooltip
              contentStyle={{
                background: 'rgba(10,10,15,0.92)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontSize: 11,
                color: 'rgba(255,255,255,0.8)',
                padding: '6px 10px',
              }}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
              formatter={(value, name) => {
                const numericValue =
                  typeof value === 'number' ? value : Number(value != null ? value : 0)
                const dataKey = String(name)
                if (dataKey === 'temp') return [`${numericValue}°`, '기온']
                if (dataKey === 'precip') return [`${numericValue}%`, '강수확률']
                return [`${numericValue} m/s`, '바람']
              }}
            />

            {chartTab === 'temp' && (
              <Area
                yAxisId='temp'
                type='monotone'
                dataKey='temp'
                stroke='#f59e0b'
                strokeWidth={2}
                fill='url(#gradTemp)'
                activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
                dot={props => (
                  <CustomDotWithLabel
                    key={`dot-temp-${props.index}`}
                    {...props}
                    color='#f59e0b'
                    unit='°'
                    total={hourlyItems.length}
                    peakIndex={peakIndex}
                  />
                )}
              />
            )}
            {chartTab === 'precip' && (
              <Area
                yAxisId='precip'
                type='monotone'
                dataKey='precip'
                stroke='#38bdf8'
                strokeWidth={2}
                fill='url(#gradPrecip)'
                activeDot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
                dot={props => (
                  <CustomDotWithLabel
                    key={`dot-precip-${props.index}`}
                    {...props}
                    color='#38bdf8'
                    unit='%'
                    total={hourlyItems.length}
                    peakIndex={peakIndex}
                  />
                )}
              />
            )}
            {chartTab === 'wind' && (
              <Area
                yAxisId='wind'
                type='monotone'
                dataKey='wind'
                stroke='#a3e635'
                strokeWidth={2}
                fill='url(#gradWind)'
                activeDot={{ r: 4, fill: '#a3e635', strokeWidth: 0 }}
                dot={props => (
                  <CustomDotWithLabel
                    key={`dot-wind-${props.index}`}
                    {...props}
                    color='#a3e635'
                    unit='m/s'
                    total={hourlyItems.length}
                    peakIndex={peakIndex}
                  />
                )}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
