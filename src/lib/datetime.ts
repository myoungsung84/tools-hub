import 'dayjs/locale/ko'

import dayjs from 'dayjs'

dayjs.locale('ko')

export function getClockParts(d: Date | dayjs.Dayjs = new Date()) {
  const t = dayjs(d)

  return {
    ampm: t.hour() >= 12 ? '오후' : '오전',
    time: t.format('hh:mm:ss'), // 12시간제
  }
}

export function getKoreanDateLine(d: Date | dayjs.Dayjs = new Date()) {
  return dayjs(d).format('YYYY년 M월 D일 dddd')
}

export function getClock12(now: Date) {
  const h24 = now.getHours()
  const h12 = h24 % 12 || 12
  const ampm = h24 < 12 ? 'AM' : 'PM'

  const hh = String(h12).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  return { ampm, hh, mm, ss }
}
