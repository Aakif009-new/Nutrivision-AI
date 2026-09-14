export interface ScoreColors {
  base: string;
  bg: string;
  text: string;
  label: string;
}

export function getScoreColor(score: number): ScoreColors {
  if (score >= 90) {
    return {
      base: '#22C55E',
      bg: '#DCFCE7',
      text: '#166534',
      label: 'Excellent',
    };
  } else if (score >= 75) {
    return {
      base: '#F59E0B',
      bg: '#FEF3C7',
      text: '#92400E',
      label: 'Good',
    };
  } else {
    return {
      base: '#EF4444',
      bg: '#FEE2E2',
      text: '#991B1B',
      label: 'Moderate',
    };
  }
}
