import type { HistoryAlbum } from '~/types/Album';

export const getAlbumHistory = (): HistoryAlbum[] => {
  const localStorageValue = localStorage.getItem('albumHistory');
  return localStorageValue ? JSON.parse(localStorageValue) : [];
};

const setAlbumHistory = (albums: HistoryAlbum[]): void => {
  localStorage.setItem('albumHistory', JSON.stringify(albums));
};

export const addToHistory = (album: HistoryAlbum): void => {
  const albumHistory = getAlbumHistory();
  const existingIndex = albumHistory.findIndex(a => a.artist === album.artist && a.title === album.title);
  if (existingIndex === -1) {
    albumHistory.push(album);
    setAlbumHistory(albumHistory);
  }
};

export const updateLogStatus = (album: HistoryAlbum, logStatus: boolean): void => {
  const albumHistory = getAlbumHistory();
  const index = albumHistory.findIndex(a => a.artist === album.artist && a.title === album.title);
  if (index !== -1) {
    albumHistory[index] = { ...albumHistory[index], logged: logStatus, logDate: logStatus ? new Date().toISOString() : undefined };
  } else if (logStatus) {
    albumHistory.push(album);
  }
  setAlbumHistory(albumHistory);
};

export const updateLikeStatus = (album: HistoryAlbum, likeStatus: boolean): void => {
  const albumHistory = getAlbumHistory();
  const index = albumHistory.findIndex(a => a.artist === album.artist && a.title === album.title);
  if (index !== -1) {
    albumHistory[index] = { ...albumHistory[index], liked: likeStatus };
  } else if (likeStatus) {
    const newHistoryAlbum = album;
    albumHistory.push(newHistoryAlbum);
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

export const isAlbumLogged = (history: HistoryAlbum[], album: HistoryAlbum): boolean => {
  const foundAlbum = history.find(h => h.artist === album.artist && h.title === album.title);
  return foundAlbum ? foundAlbum.logged : false;
};

export const isAlbumLiked = (history: HistoryAlbum[], album: HistoryAlbum): boolean => {
  const foundAlbum = history.find(h => h.artist === album.artist && h.title === album.title);
  return foundAlbum ? foundAlbum.liked : false;
};
