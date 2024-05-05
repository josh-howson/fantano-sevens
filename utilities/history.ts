import { getCookie, setCookie } from '~/utilities/cookie';
import type { HistoryAlbum, Album } from '~/types/Album';

export const getAlbumHistory = (): HistoryAlbum[] => {
  const cookieValue = getCookie('albumHistory');
  return cookieValue ? JSON.parse(cookieValue) : [];
};

const setAlbumHistory = (albums: HistoryAlbum[]): void => {
  // Remove unnecessary fields from each album object before setting the cookie
  const cleanedAlbums = albums.map(album => {
    const { artist, title, liked, logged } = album;
    return { artist, title, liked, logged };
  });
  setCookie('albumHistory', JSON.stringify(cleanedAlbums));
};

export const addToHistory = (album: Album): void => {
  const albumHistory = getAlbumHistory();
  const existingIndex = albumHistory.findIndex(a => a.artist === album.artist && a.title === album.title);
  if (existingIndex === -1) {
    albumHistory.push({ ...album, logged: false, liked: false });
    setAlbumHistory(albumHistory);
  }
};

export const updateLogStatus = (album: Album, logStatus: boolean): void => {
  const albumHistory = getAlbumHistory();
  const index = albumHistory.findIndex(a => a.artist === album.artist && a.title === album.title);
  if (index !== -1) {
    albumHistory[index] = { ...albumHistory[index], logged: logStatus };
  } else if (logStatus) {
    albumHistory.push({ ...album, logged: true, liked: false });
  }
  setAlbumHistory(albumHistory);
};

export const updateLikeStatus = (album: Album, likeStatus: boolean): void => {
  const albumHistory = getAlbumHistory();
  const index = albumHistory.findIndex(a => a.artist === album.artist && a.title === album.title);
  if (index !== -1) {
    albumHistory[index] = { ...albumHistory[index], liked: likeStatus };
  } else if (likeStatus) {
    albumHistory.push({ ...album, logged: false, liked: true });
  }
  setAlbumHistory(albumHistory);
};

export const removeFromHistory = (album: HistoryAlbum): void => {
  const albumHistory = getAlbumHistory();
  const index = albumHistory.findIndex(a => a.artist === album.artist && a.title === album.title);
  if (index !== -1) {
    albumHistory.splice(index, 1);
    setAlbumHistory(albumHistory);
  }
};

export const getFullHistory = (): HistoryAlbum[] => {
  return getAlbumHistory();
};

export const isAlbumLogged = (history: HistoryAlbum[], album: Album): boolean => {
  const foundAlbum = history.find(h => h.artist === album.artist && h.title === album.title);
  return foundAlbum ? foundAlbum.logged : false;
};

export const isAlbumLiked = (history: HistoryAlbum[], album: Album): boolean => {
  const foundAlbum = history.find(h => h.artist === album.artist && h.title === album.title);
  return foundAlbum ? foundAlbum.liked : false;
};

export const getLoggedAlbums = (history: HistoryAlbum[], albums: Album[]): Album[] => {
  return albums.filter(album => isAlbumLogged(history, album));
};

export const getLikedAlbums = (history: HistoryAlbum[], albums: Album[]): Album[] => {
  return albums.filter(album => isAlbumLiked(history, album));
};
