import { REWARD_EMOJIS } from '@/app/constants/historique.constants';

export function getRewardEmoji(count: number): string | null {
  for (const { threshold, emoji } of REWARD_EMOJIS) {
    if (count >= threshold) {
      return emoji;
    }
  }
  return null;
}
