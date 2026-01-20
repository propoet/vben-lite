import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 合并类名  className
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { cn }
