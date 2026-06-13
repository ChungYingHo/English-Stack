// 全站統一的日期格式 (例: Feb 27, 2026)；無效日期回傳空字串。
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}
