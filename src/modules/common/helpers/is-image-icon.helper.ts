export const isImageIcon = (url?: string | null): boolean => {
  const cleanUrl = url ?? ""
    .split('?')[0]
    .toLowerCase();

  return /\.(png|jpe?g|webp|ico)$/.test(cleanUrl);
};
