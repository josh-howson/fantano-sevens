import { eventHandler, getQuery } from 'h3';
import { FantanoAlbum } from '~/types/Album';
import { getRandomAlbums } from '~/utilities/album';
import allReviewsStatic from '~/assets/all-reviews.json';

type FantanoReviewsRaw = FantanoAlbum[];
export default eventHandler(async (event) => {
  const allAlbums = allReviewsStatic as FantanoReviewsRaw;
  const query = getQuery(event);
  const minRating = query.minRating as string;

  const randomAlbums = await getRandomAlbums(allAlbums, Number(minRating));

  return send(event, JSON.stringify(randomAlbums), 'application/json');
});
