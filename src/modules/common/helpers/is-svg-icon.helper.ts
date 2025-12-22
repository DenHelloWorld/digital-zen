export const isSvgIcon = (url?: string | null): boolean => {
  const cleanUrl = url ?? ""
    .split('?')[0]
    .toLowerCase();

  return cleanUrl.endsWith('.svg');
};
