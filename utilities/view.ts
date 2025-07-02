export const VIEW = {
  HISTORY: 'history',
  PICKER: 'picker',
  SETTINGS: 'settings',
} as const;

export type View = (typeof VIEW)[keyof typeof VIEW];
