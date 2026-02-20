import { CalendarDays, Clock, Dice5, Globe, QrCode, Type } from 'lucide-react'

export const TOOLS_NAV = [
  { href: '/time', label: { ko: '현재시간', en: 'Time' }, icon: Clock, priority: 0.9 },
  { href: '/ip', label: { ko: '나의 아이피', en: 'IP Address' }, icon: Globe, priority: 0.8 },
  { href: '/count', label: { ko: '글자수 세기', en: 'Text Count' }, icon: Type, priority: 0.7 },
  { href: '/qr', label: { ko: 'QR 코드', en: 'QR Code' }, icon: QrCode, priority: 0.7 },
  {
    href: '/age',
    label: { ko: '나이 계산기', en: 'Age Calculator' },
    icon: CalendarDays,
    priority: 0.7,
  },
  {
    href: '/calendar',
    label: { ko: '음력 달력', en: 'Solar/Lunar Calendar' },
    icon: CalendarDays,
    priority: 0.75,
  },
  { href: '/decide', label: { ko: '살까말까', en: 'Decide' }, icon: Dice5, priority: 0.8 },
] as const
