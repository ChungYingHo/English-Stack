// src/utils/readPath.ts

/**
 * 將各種環境下的路徑正規化，消除尾隨斜線與 .html 等後綴差異
 * @param path 原始路徑
 * @returns 正規化後的路徑
 */
export function normalizePath(path: string | undefined | null): string {
  if (!path || path === '/') return '/'
  
  // 1. 移除結尾的斜線
  let normalized = path.replace(/\/$/, '')
  
  // 2. 移除可能存在的 .html 後綴 (Production 常見情況)
  normalized = normalized.replace(/\.html$/, '')
  
  // 3. 確保路徑以 / 開頭，方便後續比對
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  
  return normalized
}
