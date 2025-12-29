export enum POSITIONS_ENUM {
  TOP_RIGHT = 'top-right',
  TOP_LEFT = 'top-left',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left',
  TOP_CENTER = 'top-center',
  BOTTOM_CENTER = 'bottom-center',
}

export type PositionsType =
  | POSITIONS_ENUM.TOP_RIGHT
  | POSITIONS_ENUM.TOP_LEFT
  | POSITIONS_ENUM.BOTTOM_RIGHT
  | POSITIONS_ENUM.BOTTOM_LEFT
  | POSITIONS_ENUM.TOP_CENTER
  | POSITIONS_ENUM.BOTTOM_CENTER;
