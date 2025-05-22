export const getMinRating = (): number | null => {
  const storedValue = localStorage.getItem('minRating');
  if (!storedValue) {
    return null;
  }

  const parsed = Number(storedValue);
  return Number.isInteger(parsed) ? parsed : null;
};

export const setMinRating = (minRating: number) => {
  localStorage.setItem('minRating', JSON.stringify(minRating));
};
