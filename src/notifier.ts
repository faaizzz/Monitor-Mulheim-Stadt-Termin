import player from 'play-sound';
import { sendTelegramMessage } from './telegram';

const play = player();

export async function notifySlotFound(label: string, content: string): Promise<void> {
  console.log(`Next Termin for ${label} exists. Date Time: ${content}`);
  console.log('');

  play.play('media/beep.wav', (err: any) => {
    if (err) console.error('Error playing audio:', err);
  });

  await sendTelegramMessage(`Next Termin for ${label} exists. Date Time: ${content}`);
}
