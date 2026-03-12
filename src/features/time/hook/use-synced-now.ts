import * as React from 'react'

export function useSyncedNow() {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    let timer: number | null = null

    const tick = () => {
      const current = new Date()
      setNow(current)
      timer = window.setTimeout(tick, 1000 - current.getMilliseconds())
    }

    tick()

    return () => {
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [])

  return now
}
