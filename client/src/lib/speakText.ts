export function speakText(text: string, lang?: string) {
  if (!('speechSynthesis' in window)) return

  const resolvedLang =
    lang ?? (/[\u0400-\u04FF]/.test(text) ? 'ru-RU' : 'en-US')

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = resolvedLang
  utterance.rate = 0.92
  window.speechSynthesis.speak(utterance)
}
