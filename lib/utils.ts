import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMetric(value: number | undefined | null): string {
  if (value == null) return "0"
  return new Intl.NumberFormat("en-US", { 
    notation: "compact", 
    maximumFractionDigits: 1 
  }).format(value).toLowerCase()
}
