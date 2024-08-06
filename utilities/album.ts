import type { Album, FantanoAlbum, HistoryAlbum, SpotifySearchResponseRaw } from "~/types/Album";
import type { OpenAICompletionRequestBody, OpenAICompletionResponse } from "~/types/OpenAI";

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
      console.error(error);
    }
  } while (randomAlbums.length < ALBUM_COUNT && albumPool.length);

  return randomAlbums;
};

export const getAlbumOverview = async (album: Album) => {
  const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

  const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const prompt = `Provide a 2 paragraph summary of the following album: Title: ${album.title}, Artist: ${album.artist}, Release date: ${album.date}, Genre: ${album.genre}. First paragraph is a short summary or anecdote in under 250 characters, while the second expands further on the album. Respond with summary only. Format response in lowercase except for acronyms and artists/albums/songs - in which case preserve original capitalization... be consistent with capitalization.`;

  const payload: OpenAICompletionRequestBody = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  });

  const resJSON = await res.json() as OpenAICompletionResponse;

  return resJSON.choices[0].message.content;
}

export const formatAlbumTitleAndArtist = (album: Album) => {
  return `${album.title} by ${album.artist}`
};

export const getAlbumSpotifyUrl = (album: Album) => {
  return album.spotifyAlbum.external_urls.spotify;
};

export const getAlbumImage = (album: Album, size: 'medium' | 'small' = 'medium') => {
  if (size === 'small')
    return album.spotifyAlbum.images[2];

  return album.spotifyAlbum.images[1];
};

export const getHistoryAlbumFromAlbum = (album: Album, liked: boolean = false, logged: boolean = false): HistoryAlbum => {
  return {
    albumCoverUrl: getAlbumImage(album).url,
    artist: album.artist,
    title: album.title,
    liked: liked,
    logged: logged,
    spotifyUrl: getAlbumSpotifyUrl(album),
  };
}
