import { eventHandler, getQuery } from 'h3';
import { FantanoAlbum } from '~/types/Album';
import { getRandomAlbums } from '~/utilities/album';

const REVIEWS_JSON_URL = 'https://raw.githubusercontent.com/garcia-santiago/fantanoScraper/master/master.json';

type FantanoReviewsRaw = FantanoAlbum[];
export default eventHandler(async (event) => {
  const allAlbumsResponse = await fetch(REVIEWS_JSON_URL);
  const allAlbums = await allAlbumsResponse.json() as FantanoReviewsRaw;
  const query = getQuery(event);
  const minRating = query.minRating as string;

  const randomAlbums = await getRandomAlbums(allAlbums, Number(minRating));

  return send(event, JSON.stringify(randomAlbums), 'application/json');
});
