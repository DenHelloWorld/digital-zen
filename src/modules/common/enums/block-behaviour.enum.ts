export enum BLOCK_BEHAVIOUR_ENUM {
  BLOCK = 'block',
  WARN = 'warn',
  WHITELIST = 'whiteList',
}

export type BlockBehaviourType =
  | BLOCK_BEHAVIOUR_ENUM.BLOCK
  | BLOCK_BEHAVIOUR_ENUM.WARN
  | BLOCK_BEHAVIOUR_ENUM.WHITELIST;
