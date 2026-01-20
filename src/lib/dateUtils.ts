// src/lib/dateUtils.ts
export type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'custom'

export interface DateRange {
  start: string  // ISO 日期字符串 YYYY-MM-DD
  end: string
}

export function getDateRange(type: DateFilterType): DateRange | null {
  if (type === 'all') return null

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (type) {
    case 'today':
      return {
        start: formatDate(today),
        end: formatDate(today),
      }

    case 'week': {
      const dayOfWeek = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return {
        start: formatDate(monday),
        end: formatDate(sunday),
      }
    }

    case 'month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return {
        start: formatDate(firstDay),
        end: formatDate(lastDay),
      }
    }

    default:
      return null
  }
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
