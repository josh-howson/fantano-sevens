import { getCookie, deleteCookie } from '~/utilities/cookie';
import type { HistoryAlbum } from '~/types/Album';

// TODO: remove this in a couple weeks. this is to transfer any existing cookie storage over to localStorage which is the new way of storing.
const transferCookiesToLocalStorage = (): void => {
  try {
    const cookieValue = getCookie('albumHistory');
    if (cookieValue) {
      const cookieAlbums: HistoryAlbum[] = JSON.parse(cookieValue);
      const localStorageValue = localStorage.getItem('albumHistory');
      const existingAlbums: HistoryAlbum[] = localStorageValue ? JSON.parse(localStorageValue) : [];

      const mergedAlbums = cookieAlbums.reduce((acc, album) => {
        const exists = acc.some(a => a.artist === album.artist && a.title === album.title);
        if (!exists) {
          acc.push(album);
        }
        return acc;
      }, existingAlbums);

      localStorage.setItem('albumHistory', JSON.stringify(mergedAlbums));
      deleteCookie('albumHistory'); // Remove the old cookie
    }
  } catch (error) {
    console.error("Error transferring cookies to localStorage: ", error);
  }
};

// Call this function when the app initializes
transferCookiesToLocalStorage();

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
    albumHistory[index] = { ...albumHistory[index], logged: logStatus };
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

export const getFullHistory = (): HistoryAlbum[] => {
  return getAlbumHistory();
};

export const isAlbumLogged = (history: HistoryAlbum[], album: HistoryAlbum): boolean => {
  const foundAlbum = history.find(h => h.artist === album.artist && h.title === album.title);
  return foundAlbum ? foundAlbum.logged : false;
};

export const isAlbumLiked = (history: HistoryAlbum[], album: HistoryAlbum): boolean => {
  const foundAlbum = history.find(h => h.artist === album.artist && h.title === album.title);
  return foundAlbum ? foundAlbum.liked : false;
};
