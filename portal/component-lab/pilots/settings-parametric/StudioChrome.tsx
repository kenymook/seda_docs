import React from 'react';
import {IconButton} from '@seda-ai/ui';
import {StudioRailIcon} from './StudioRailIcon';
import {foundationSections} from './foundation-model.mjs';
import {useStudioScrollbars} from './useStudioScrollbars';
import './studio-chrome.css';

export const studioAreas=[{id:'lab',label:'SEDA AI Lab'},{id:'foundation',label:'Палитра'},{id:'semantic',label:'Семантика'},{id:'components',label:'Компоненты'},...foundationSections];
export function StudioHeader({actions}:{actions:React.ReactNode}){
 return <header className="studio-header"><strong className="studio-brand">SEDA</strong><div className="studio-header-actions">{actions}</div></header>;
}
export function StudioRail({area,onSelect}:{area:string;onSelect?:(id:string)=>void}){
 useStudioScrollbars();
 return <nav className="studio-rail" aria-label="Области SEDA">{studioAreas.map(({id,label})=><IconButton key={id} variant="ghost" aria-label={label} tooltip={label} aria-current={area===id?'page':undefined} icon={<StudioRailIcon area={id}/>} onClick={()=>{if(id==='lab')window.location.assign('./');else if(onSelect)onSelect(id);else window.location.assign('./tokens.html?area='+id);}}/>)}</nav>;
}
