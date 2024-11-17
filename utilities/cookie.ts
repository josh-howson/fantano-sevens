export const getCookie = (name: string): string | null => {
  const cookies = document.cookie?.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

export const setCookie = (name: string, value: string, days: number = 365): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const resetCookiesAndLocalStorage = () => {
  function clearCookies() {
      const cookies = document.cookie.split("; ");
      for (const cookie of cookies) {
          const [name] = cookie.split("=");
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      }
  }

  function clearLocalStorage() {
      localStorage.clear();
  }

  clearCookies();
  clearLocalStorage();

  window.location.reload();
};
