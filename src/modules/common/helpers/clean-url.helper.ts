export const cleanUrlHelper = (value: string | null | undefined): string => {
  if (!value) return '';
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}
