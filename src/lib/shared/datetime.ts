import 'dayjs/locale/ko'

import dayjs from 'dayjs'

dayjs.locale('ko')

/**
 * 시계 표시를 위한 오전/오후와 시간을 반환합니다.
 * @param {Date | dayjs.Dayjs} [d=new Date()] - 변환할 날짜 객체
 * @returns {{ampm: string, time: string}} 오전/오후와 12시간제 시간
 */
export function getClockParts(d: Date | dayjs.Dayjs = new Date()) {
  const t = dayjs(d)

  return {
    ampm: t.hour() >= 12 ? '오후' : '오전',
    time: t.format('hh:mm:ss'), // 12시간제
  }
}

/**
 * 한국어 형식의 날짜 문자열을 반환합니다.
 * @param {Date | dayjs.Dayjs} [d=new Date()] - 변환할 날짜 객체
 * @returns {string} 'YYYY년 M월 D일 dddd' 형식의 한글 날짜 문자열
 */
export function getKoreanDateLine(d: Date | dayjs.Dayjs = new Date()) {
  return dayjs(d).format('YYYY년 M월 D일 dddd')
}

/**
 * 12시간제 시계 정보를 반환합니다.
 * @param {Date} now - 현재 날짜 객체
 * @returns {{ampm: string, hh: string, mm: string, ss: string}} AM/PM과 시, 분, 초 (2자리 패딩)
 */
export function getClock12(now: Date) {
  const h24 = now.getHours()
  const h12 = h24 % 12 || 12
  const ampm = h24 < 12 ? 'AM' : 'PM'

  const hh = String(h12).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  return { ampm, hh, mm, ss }
}
