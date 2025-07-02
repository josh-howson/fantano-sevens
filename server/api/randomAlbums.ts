import { eventHandler } from 'h3';
import { FantanoAlbum, HistoryAlbum } from '~/types/Album';
import { getRandomAlbums } from '~/utilities/album';
import allReviewsStatic from '~/assets/all-reviews.json';

type FantanoReviewsRaw = FantanoAlbum[];
export default eventHandler(async (event) => {
  const allAlbums = allReviewsStatic as FantanoReviewsRaw;

  type RequestBody = {
    minRating: string;
    loggedAlbums: HistoryAlbum[];
  };
  const body = await readBody(event) as RequestBody;
  const randomAlbums = await getRandomAlbums(allAlbums, Number(body.minRating), body.loggedAlbums);

  return send(event, JSON.stringify(randomAlbums), 'application/json');
});
