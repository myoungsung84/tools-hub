import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import * as React from 'react'

dayjs.extend(utc)
dayjs.extend(timezone)

const DEFAULT_TIME_ZONE = 'Asia/Seoul'

export function useSyncedNow(timeZone = DEFAULT_TIME_ZONE) {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    let timer: number | null = null

    const tick = () => {
      const current = dayjs().tz(timeZone)
      setNow(current.toDate())
      timer = window.setTimeout(tick, 1000 - current.millisecond())
    }

    tick()

    return () => {
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [timeZone])

  return now
}
