export enum COLORS_ENUM {
  ACCENT = 'var(--color-zen-accent)',
  ON_ACCENT = 'var(--color-on-accent)',
  WARN = 'var(--color-zen-warn)',
  ERROR = 'var(--color-zen-error)',
  SUCCESS = 'var(--color-zen-success)',
  INFO = 'var(--color-zen-info)',
  DEFAULT = 'var(--color-text)',
}

export type ColorType = typeof COLORS_ENUM;
