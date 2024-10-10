import { eventHandler, readBody } from 'h3';
import { Album } from '~/types/Album';
import { getAlbumOverview } from '~/utilities/album';

export default eventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const album = JSON.parse(body) as Album;
    const albumOverview = await getAlbumOverview(album);
    return send(event, JSON.stringify(albumOverview), 'application/json');
  } catch (error) {
    console.error('Error fetching album overview:', error);
    setResponseStatus(event, 500);
    return send(event, JSON.stringify({ error: 'Failed to fetch album overview.' }), 'application/json');
  }
});
