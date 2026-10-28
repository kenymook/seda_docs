import React from 'react';

/** Editor navigation glyphs. SEDA IconButton owns sizing, states and accessibility. */
export function StudioRailIcon({area}:{area:string}){
 const glyphs:Record<string,React.ReactNode>={
  foundation:<><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="11" r=".8" fill="currentColor"/><circle cx="10" cy="6.8" r=".8" fill="currentColor"/><circle cx="15" cy="7.5" r=".8" fill="currentColor"/><circle cx="17.5" cy="11" r=".8" fill="currentColor"/></>,
  semantic:<><path d="m8 7 8 4M8 17l8-4M6 9v6"/><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/></>,
  components:<><path d="m12 2 4 4-4 4-4-4Zm-6 6 4 4-4 4-4-4Zm12 0 4 4-4 4-4-4Zm-6 6 4 4-4 4-4-4Z"/></>,
  typography:<><path d="M3 6V4h12v2M9 4v16M6 20h6M15 11v-1h7v1M18.5 10v10M16 20h5"/></>,
  radius:<><path d="M4 19V5h6a9 9 0 0 1 9 9v5M4 19h3m3 0h3m3 0h3"/><path d="M10 9a5 5 0 0 1 5 5"/></>,
  spacing:<><path d="M4 4v16M20 4v16M7 12h10m-7-3-3 3 3 3m4-6 3 3-3 3"/></>,
  borders:<><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 4h16" strokeWidth="3"/></>,
  motion:<><path d="M5 7a9 9 0 1 1-1.5 9M3 4v4h4"/><path d="m10 8 6 4-6 4Z"/></>,
  opacity:<><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/></>,
 };
 if(!Object.hasOwn(glyphs,area))throw new TypeError('Unknown editor area');
 return <svg className="studio-rail-glyph" data-studio-icon={area} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{glyphs[area]}</svg>;
}
