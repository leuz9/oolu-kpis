export function calculateTrend(newValue: number, currentValue: number): 'up' | 'down' | 'stable' {
  if (newValue > currentValue) return 'up';
  if (newValue < currentValue) return 'down';
  return 'stable';
}

export function calculateStatus(value: number, target: number): 'on-track' | 'at-risk' | 'behind' {
  const progress = (value / target) * 100;
  if (progress >= 90) return 'on-track';
  if (progress >= 60) return 'at-risk';
  return 'behind';
}