// src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS 클래스명을 병합합니다. clsx와 tailwind-merge를 결합하여 중복된 클래스를 제거합니다.
 * @param {...ClassValue[]} inputs - 병합할 클래스명 목록
 * @returns {string} 병합된 클래스명 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * clsx를 사용하여 클래스명을 결합합니다.
 * @param {...ClassValue[]} inputs - 결합할 클래스명 목록
 * @returns {string} 결합된 클래스명 문자열
 */
export function cx(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * data-state 속성에 대한 Tailwind CSS 선택자를 생성합니다.
 * @param {string} state - data-state 값
 * @param {string} className - 적용할 클래스명
 * @returns {string} data-state 선택자 문자열
 */
export function dataState(state: string, className: string) {
  return `[data-state="${state}"]:${className}`
}

/**
 * 수평 스택 레이아웃을 위한 클래스명을 생성합니다.
 * @param {string} [className] - 추가 클래스명
 * @returns {string} 수평 스택 클래스명
 */
export function hstack(className?: string) {
  return cn('flex items-center', className)
}

/**
 * 수직 스택 레이아웃을 위한 클래스명을 생성합니다.
 * @param {string} [className] - 추가 클래스명
 * @returns {string} 수직 스택 클래스명
 */
export function vstack(className?: string) {
  return cn('flex flex-col', className)
}
