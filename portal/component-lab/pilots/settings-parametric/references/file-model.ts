import seed from './recents-data.json';
export interface WorkspaceFile {
 id:string; nodeId?:string; name:string; type:string; team:string; updated:string;
 thumbnail?:string; avatar?:string; icon?:string; previewInset?:number; shared:boolean; folder:string;
 trashed:boolean; starred:boolean; viewed:number;
}
export interface Preferences { theme:'light'|'dark';size:'s'|'m'|'l'|'xl';airX:number;airY:number;view:'grid'|'list' }
export const filesKey='seda.reference.recents.files.v1',preferencesKey='seda.reference.recents.preferences.v1';
export const defaults:Preferences={theme:'dark',size:'m',airX:0,airY:0,view:'grid'};
export const initialFiles=seed.files as WorkspaceFile[];
const assets=new Set(initialFiles.flatMap(file=>[file.thumbnail,file.avatar,file.icon].filter(Boolean)));
export function readFiles(raw:string|null):WorkspaceFile[]{
 if(raw===null)return structuredClone(initialFiles);
 const value=JSON.parse(raw);if(value?.version!==1||!Array.isArray(value.files)||value.files.length>2000)throw Error('Неподдерживаемый формат файлов');
 const ids=new Set<string>();
 for(const file of value.files){
  if(!file||typeof file.id!=='string'||!file.id.trim()||ids.has(file.id)||typeof file.name!=='string'||!file.name.trim()||file.name.length>160||!['design','published','figjam','slides','make','repo','prototype'].includes(file.type)||!['team','updated','folder'].every(key=>typeof file[key]==='string')||!['shared','trashed','starred'].every(key=>typeof file[key]==='boolean')||!Number.isFinite(file.viewed)||(file.previewInset!==undefined&&![0,10].includes(file.previewInset))||![file.thumbnail,file.avatar,file.icon].every(asset=>asset===undefined||assets.has(asset)))throw Error('Повреждены данные рабочего пространства');
  ids.add(file.id);
 }
 return value.files;
}
export function readPreferences(raw:string|null):Preferences{
 if(!raw)return {...defaults};const value=JSON.parse(raw);
 if(!value||!['light','dark'].includes(value.theme)||!['s','m','l','xl'].includes(value.size)||!['grid','list'].includes(value.view)||!Number.isInteger(value.airX)||value.airX<0||value.airX>24||!Number.isInteger(value.airY)||value.airY<0||value.airY>12)throw Error('Повреждены параметры интерфейса');
 return value;
}
export interface FileQuery {section:string;tab:string;query:string;organization:string;type:string;folder:string|null}
export function filterFiles(files:readonly WorkspaceFile[],filter:FileQuery){
 const query=filter.query.normalize('NFKC').toLocaleLowerCase().trim();
 return files.filter(file=>
  (filter.section==='trash'?file.trashed:!file.trashed)&&
  (filter.section!=='drafts'||file.team==='Drafts')&&
  (filter.section!=='community'||file.type==='published')&&
  (!filter.section.startsWith('project:')||file.team.replace(/^[^\p{L}\p{N}]+/u,'').trim()===filter.section.slice(8))&&
  (filter.tab!=='shared'||file.shared)&&
  (filter.organization==='all'||file.team===filter.organization)&&
  (filter.type==='all'||file.type===filter.type)&&
  (!filter.folder||file.folder===filter.folder)&&
  (!query||[file.name,file.team,file.folder].some(text=>text.normalize('NFKC').toLocaleLowerCase().includes(query)))
 );
}
export function nameError(name:string){return !name.trim()?'Введите название файла':name.trim().length>160?'Не больше 160 символов':undefined;}
