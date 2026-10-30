import {defaults, readPreferences} from './file-model';
import type {Preferences} from './file-model';

export type SandboxPreferences = Preferences;
export const defaultSandboxPreferences: SandboxPreferences = {...defaults, size:'s'};

/** Older saved appearance has no UI scale; document/camera values never enter this preference. */
export function readSandboxPreferences(raw: string | null): SandboxPreferences {
  if(raw===null)return {...defaultSandboxPreferences};
  return readPreferences(raw);
}
