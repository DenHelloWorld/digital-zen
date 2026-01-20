export enum BLOCK_BEHAVIOUR_ENUM {
  BLOCK = 'block',
  WARN = 'warn',
  ALLOW = 'allow',
}

export type BlockBehaviourType =
  | BLOCK_BEHAVIOUR_ENUM.BLOCK
  | BLOCK_BEHAVIOUR_ENUM.WARN
  | BLOCK_BEHAVIOUR_ENUM.ALLOW;
