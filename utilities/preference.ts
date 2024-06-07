import { getCookie, setCookie } from '~/utilities/cookie';

export const getMinRatingFromCookie = (): number | null => {
  const cookieValue = getCookie('minRating');
  if (!cookieValue) {
    return null;
  }

  const parsedCookie = Number(cookieValue);
  return Number.isInteger(parsedCookie) ? parsedCookie : null;
};

export const setMinRatingCookie = (minRating: number) => {
  setCookie('minRating', JSON.stringify(minRating));
}
