// src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cx(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function dataState(state: string, className: string) {
  return `[data-state="${state}"]:${className}`
}

export function hstack(className?: string) {
  return cn('flex items-center', className)
}

export function vstack(className?: string) {
  return cn('flex flex-col', className)
}
