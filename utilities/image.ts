export const preloadImage = (imageUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve();
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));

    img.src = imageUrl;
  });
};
