import type { Album, FantanoAlbum, SpotifySearchResponseRaw } from "~/types/Album";

const getSpotifyAccessToken = async (clientId: string, clientSecret: string): Promise<string> => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
};

export const getRandomAlbums = async (allAlbums: FantanoAlbum[], minRating: number) => {
  const ALBUM_COUNT = 10;
  const config = useRuntimeConfig();
  const token = await getSpotifyAccessToken(config.spotifyClientId, config.spotifyClientSecret);

  if (minRating < 0 || minRating > 10) throw new Error(`The minRating must be between 1 and 10. Provided: ${minRating}`);
  const albumPool = allAlbums.filter(album => album.score >= minRating);
  const randomAlbums: Album[] = [];

  do {
    const randomIndex = Math.floor(Math.random() * albumPool.length);
    const randomAlbum = albumPool[randomIndex];
    // remove from the pool
    albumPool.splice(randomIndex, 1);

    // fetch data from spotify api
    const { title, artist } = randomAlbum;
    const spotifyResponse = await fetch(`https://api.spotify.com/v1/search?q=album:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}&type=album&limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const spotifyResultsRaw = await spotifyResponse.json() as SpotifySearchResponseRaw;

    const albumToPush = {
      ...randomAlbum,
      spotifyAlbum: spotifyResultsRaw.albums.items[0],
    } as Album;

    try {
      if (!albumToPush.spotifyAlbum) throw new Error(`Could not successfully retrieve album info for ${formatAlbumTitleAndArtist(albumToPush)}`)
      randomAlbums.push(albumToPush);
    } catch (error) {
      console.log(error);
    }
  } while (randomAlbums.length < ALBUM_COUNT && albumPool.length);

  return randomAlbums;
};

export const formatAlbumTitleAndArtist = (album: Album) => {
  return `${album.title} by ${album.artist}`
};

export const getAlbumSpotifyUrl = (album: Album) => {
  return album.spotifyAlbum.external_urls.spotify;
};
