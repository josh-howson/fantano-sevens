import type { HistoryAlbum } from '~/types/Album';

export const getAlbumHistory = (): HistoryAlbum[] => {
  const localStorageValue = localStorage.getItem('albumHistory');

  if (!localStorageValue) return [];

  return JSON.parse(localStorageValue, (key, value) => {
    if (
      (key === 'streamDate' || key === 'logDate') &&
      typeof value === 'string'
    ) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }
    return value;
  });
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
    albumHistory[index] = { ...albumHistory[index], logged: logStatus, logDate: logStatus ? new Date() : undefined };
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

export const incrementLifetimeSpins = (): void => {
  const storageKey = 'lifetimeSpins';
  const currentValue = localStorage.getItem(storageKey);

  let spins = currentValue ? parseInt(currentValue, 10) : 0;

  if (isNaN(spins)) {
    spins = 0;
  }

  spins += 1;

  localStorage.setItem(storageKey, spins.toString());
};

export const getLifetimeSpins = (): number => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return -1;
  const storageKey = 'lifetimeSpins';
  const currentValue = localStorage.getItem(storageKey);

  const spins = currentValue ? parseInt(currentValue, 10) : 0;

  return isNaN(spins) ? 0 : spins;
};

