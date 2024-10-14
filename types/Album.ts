// The type from the github json dump
export type FantanoAlbum = {
  artist: string;
  title: string;
  score: number;
  date: string;
  genre: string;
  transcript?: string;
};

// The main type for use on the frontend
export type Album = FantanoAlbum & {
  spotifyAlbum: SpotifyAlbum;
};

type SpotifyArtist = {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
};

type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

export type SpotifyAlbum = {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  restrictions?: {
    reason: string;
  };
  type: "album";
  uri: string;
  artists: SpotifyArtist[];
};

export type SpotifyResult = {
  album: SpotifyAlbum;
};

export type SpotifySearchResponseRaw = {
  albums: {
    href: string;
    items: SpotifyAlbum[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
};

export type ShuffleStatus = 'init' | 'shuffling' | 'picked';

export type HistoryAlbum = {
  title: string;
  artist: string;
  logged: boolean;
  logDate?: string;
  liked: boolean;
  albumCoverUrl: string;
  spotifyUrl: string;
};
