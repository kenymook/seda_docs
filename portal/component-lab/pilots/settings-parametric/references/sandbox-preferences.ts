import {defaults, readPreferences} from './file-model';
import type {Preferences} from './file-model';

export interface SandboxPreferences extends Preferences { scale: number }
export const defaultSandboxPreferences: SandboxPreferences = {...defaults, size:'s', scale:100};

/** Older saved appearance has no UI scale; document/camera values never enter this preference. */
export function readSandboxPreferences(raw: string | null): SandboxPreferences {
  if(raw===null)return {...defaultSandboxPreferences};
  const base=readPreferences(raw),value=JSON.parse(raw);
  const scale=value.scale===undefined?100:value.scale;
  if(typeof scale!=='number'||!Number.isFinite(scale)||scale<80||scale>150)throw new Error('Invalid Sandbox UI scale');
  return {...base,scale};
}
