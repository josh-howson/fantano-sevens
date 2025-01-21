// Define the structure of the exported/imported data
interface UserData {
  cookies: Record<string, string>;
  localStorage: Record<string, string>;
}

// Export User Data (Cookies and LocalStorage)
export function exportUserData(): void {
  // Get all cookies
  const getAllCookies = (): Record<string, string> => {
    const cookies = document.cookie.split('; ');
    const cookieData: Record<string, string> = {};
    cookies.forEach((cookie) => {
      const [key, value] = cookie.split('=');
      cookieData[key] = decodeURIComponent(value || '');
    });
    return cookieData;
  };

  // Get all localStorage items
  const getLocalStorageData = (): Record<string, string> => {
    const localStorageData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageData[key] = localStorage.getItem(key) || '';
      }
    }
    return localStorageData;
  };

  // Combine cookies and localStorage into one object
  const userData: UserData = {
    cookies: getAllCookies(),
    localStorage: getLocalStorageData(),
  };

  // Convert the data to JSON
  const jsonBlob = new Blob([JSON.stringify(userData, null, 2)], {
    type: 'application/json',
  });

  // Create a download link for the JSON file
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(jsonBlob);
  downloadLink.download = 'user-data.json';

  // Trigger the download
  downloadLink.click();
}

// Import User Data (Cookies and LocalStorage)
export function importUserData(file: File): void {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    try {
      const userData: UserData = JSON.parse(event.target?.result as string);

      // Set cookies
      if (userData.cookies) {
        for (const [key, value] of Object.entries(userData.cookies)) {
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
        }
      }

      // Set localStorage
      if (userData.localStorage) {
        for (const [key, value] of Object.entries(userData.localStorage)) {
          localStorage.setItem(key, value);
        }
      }

      alert('User data has been successfully imported. The app will now restart to apply changes.');
      window.location.reload();
    } catch (error) {
      alert('Failed to import data. Please ensure the file is valid.');
      console.error('Error parsing user data:', error);
    }
  };

  reader.onerror = () => {
    alert('Failed to read the file. Please try again.');
  };

  reader.readAsText(file);
}

// Add file input for importing data
export function setupImportButton(): void {
  const importButton = document.createElement('input');
  importButton.type = 'file';
  importButton.accept = '.json';
  importButton.style.display = 'none';
  document.body.appendChild(importButton);

  importButton.addEventListener('change', (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      importUserData(file);
    }
  });

  importButton.click();
}
