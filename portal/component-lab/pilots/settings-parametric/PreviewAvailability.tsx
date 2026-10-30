import React from 'react';
import {componentAvailability} from './component-availability.mjs';
import {componentCoverage} from 'seda:catalog';
export function PreviewAvailability({name}:{name:string}){
 const availability=componentAvailability(componentCoverage.catalog,name);
 return <div className="studio-preview-availability" data-availability={availability.kind} role="note">
  <h2>{name}</h2><p className="studio-preview-kind">{availability.label}</p><p>{availability.description}</p>
  <p>Назначения цветов можно менять в инспекторе. Живого предпросмотра результата на этом экране пока нет.</p>
 </div>;
}
