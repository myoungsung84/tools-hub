import * as React from 'react'

export function useSyncedNow() {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    let timer: number | null = null

    const tick = () => {
      const d = new Date()
      setNow(d)
      timer = window.setTimeout(tick, 1000 - d.getMilliseconds())
    }

    tick()

    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  return now
}
