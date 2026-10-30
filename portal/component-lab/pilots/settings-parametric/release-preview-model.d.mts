export type ReleaseState={scenario:string;revision:number;validatedRevision:number|null;acknowledged:boolean;phase:string;current:string|null;history:{version:string;description:string;rollbackOf:string|null;edits:Record<string,string>}[];message:string;draft:boolean;operation:string|null;restoreTarget?:string;publicationEdits?:Record<string,string>;publishingRevision?:number;conflictResolution?:string};
export type ReleaseEvent={type:string;revision?:number;value?:boolean|string;operation?:string|null;description?:string;version?:string;choice?:string;edits?:Record<string,string>};
export const scenarios:string[][];
export function initialReleaseState(scenario?:string):ReleaseState;
export function releaseBlocker(state:ReleaseState):string|null;
export function transitionRelease(state:ReleaseState,event:ReleaseEvent):ReleaseState;

export function nextReleaseVersion(current:string|null):string;
