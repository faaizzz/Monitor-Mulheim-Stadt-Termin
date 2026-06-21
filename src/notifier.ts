import player from 'play-sound';
import { sendTelegramMessage } from './telegram';

const play = player();

export async function notifySlotFound(label: string, content: string): Promise<void> {
  console.log(`Next Termin for ${label} exists. Date Time: ${content}`);
  console.log('');

  // play-sound throws synchronously (not just via the callback) when no audio
  // player binary exists at all, e.g. on a headless VPS — must not block the
  // notification channels below.
  try {
    play.play('media/beep.wav', (err: any) => {
      if (err) console.error('Error playing audio:', err.message ?? err);
    });
  } catch (err: any) {
    console.error('Error playing audio:', err.message ?? err);
  }

  await sendTelegramMessage(`Next Termin for ${label} exists. Date Time: ${content}`);
}
