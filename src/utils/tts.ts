// 共用的文字轉語音 (TTS) 工具
// 統一發音設定 (en-US, rate 0.85)，避免在多個元件重複實作 SpeechSynthesis 邏輯。

interface SpeakHandlers {
  onend?: () => void
  onerror?: () => void
}

/**
 * 朗讀指定文字。會先取消佇列中的語音，確保一次只播放一個單字。
 * @param text 要朗讀的文字
 * @param handlers 可選的 onend / onerror 回呼 (供呼叫端做 UI 狀態切換)
 */
export function speak(text: string, handlers: SpeakHandlers = {}): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.85

  if (handlers.onend) utterance.onend = handlers.onend
  if (handlers.onerror) utterance.onerror = handlers.onerror

  window.speechSynthesis.speak(utterance)
}
