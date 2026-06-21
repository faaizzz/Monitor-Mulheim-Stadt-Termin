import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Telegram notification helper.
 *
 * Requires two environment variables:
 *   TELEGRAM_BOT_TOKEN  – Bot token from @BotFather
 *   TELEGRAM_CHAT_ID    – Chat / channel ID to send messages to
 */

const logDir = join(__dirname, '..', 'logs');
const logPath = join(logDir, 'telegram.log');

function logDeliveryAttempt(status: 'SENT' | 'FAILED' | 'SKIPPED', detail: string): void {
  mkdirSync(logDir, { recursive: true });
  appendFileSync(logPath, `[${new Date().toISOString()}] ${status} ${detail}\n`);
}

export async function sendTelegramMessage(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set – skipping Telegram notification.');
    logDeliveryAttempt('SKIPPED', 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  } catch (err: any) {
    // Network-level failure (DNS/TCP/TLS) rather than an HTTP error response —
    // common on VPS/cloud-provider IP ranges that Telegram has rate-limited or
    // blocked. Re-throw so the caller's retry loop keeps trying, but log
    // clearly first so this doesn't read like a generic crash.
    console.error(`[Telegram] Network error reaching api.telegram.org: ${err.message}`);
    logDeliveryAttempt('FAILED', `network error: ${err.message} | message: ${message}`);
    throw err;
  }

  if (!response.ok) {
    const body = await response.text();
    console.error(`[Telegram] Failed to send message (${response.status}): ${body}`);
    logDeliveryAttempt('FAILED', `HTTP ${response.status}: ${body} | message: ${message}`);
  } else {
    console.log('[Telegram] Message sent successfully.');
    logDeliveryAttempt('SENT', `message: ${message}`);
  }
}
