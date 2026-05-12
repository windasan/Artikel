// src/lib/utils.ts
import { format, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy', { locale: localeId })
  } catch {
    return dateStr
  }
}

export function formatDateLong(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMMM yyyy', { locale: localeId })
  } catch {
    return dateStr
  }
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function wordCount(html: string): number {
  return html.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
}

export function readingTime(html: string): number {
  return Math.ceil(wordCount(html) / 200)
}
