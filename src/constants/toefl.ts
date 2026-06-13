// TOEFL 內容存取控制的單一事實來源 (Single Source of Truth)
// 密碼為刻意硬編碼 (見 CLAUDE.md)，集中於此避免散落多個元件。

export const TOEFL_STORAGE_KEY = 'toefl_auth'
export const TOEFL_PASSWORD = 'toefl2026'

/** 是否已於本次工作階段 (sessionStorage) 通過 TOEFL 密碼驗證 */
export function isToeflAuthenticated(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(TOEFL_STORAGE_KEY) === TOEFL_PASSWORD
}
