// TOEFL 內容存取控制的單一事實來源 (Single Source of Truth)
// 密碼改由環境變數 PUBLIC_TOEFL_PASSWORD 注入 (build 時設定)，未設定時退回開發預設值。
// 注意：PUBLIC_ 變數會被打包進前端 bundle，此閘門僅為輕量遮罩，並非真正的機密保護。

export const TOEFL_STORAGE_KEY = 'toefl_auth'
export const TOEFL_PASSWORD = import.meta.env.PUBLIC_TOEFL_PASSWORD ?? 'toefl2026'

/** 是否已於本次工作階段 (sessionStorage) 通過 TOEFL 密碼驗證 */
export function isToeflAuthenticated(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(TOEFL_STORAGE_KEY) === TOEFL_PASSWORD
}
