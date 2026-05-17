import store from '../store'

export async function sendTelegramLog(message: string): Promise<void> {
  const { analyticsEnabled, botToken, chatId } = store.store
  if (!analyticsEnabled || !botToken || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
    })
  } catch {
    // best-effort, ignore errors
  }
}
