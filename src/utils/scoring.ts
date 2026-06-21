import type { ScoreResult, Item } from '@/types';

export const calculateScore = (
  remainingItems: Item[],
  correctionCount: number,
  timeUsed: number,
  timeLimit: number
): ScoreResult => {
  const totalItems = remainingItems.reduce((sum, item) => sum + item.remaining, 0);
  const initialTotalItems = 4;

  const itemsMaxScore = 40;
  const itemsScore = Math.round((totalItems / Math.max(initialTotalItems, 1)) * itemsMaxScore);

  const correctionMaxScore = 30;
  const correctionPenalty = Math.min(correctionCount * 5, correctionMaxScore);
  const correctionScore = Math.max(correctionMaxScore - correctionPenalty, 0);

  const timeMaxScore = 30;
  const timeRatio = Math.max(0, Math.min(1, 1 - timeUsed / timeLimit));
  const timeScore = Math.round(timeRatio * timeMaxScore);

  const totalScore = itemsScore + correctionScore + timeScore;

  let stars: 1 | 2 | 3 = 1;
  if (totalScore >= 80) stars = 3;
  else if (totalScore >= 50) stars = 2;

  return {
    totalScore,
    stars,
    breakdown: {
      remainingItems: {
        score: itemsScore,
        maxScore: itemsMaxScore,
        remaining: totalItems,
        total: initialTotalItems,
      },
      correctionCount: {
        score: correctionScore,
        maxScore: correctionMaxScore,
        count: correctionCount,
      },
      timeBonus: {
        score: timeScore,
        maxScore: timeMaxScore,
        timeUsed,
        timeLimit,
      },
    },
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
