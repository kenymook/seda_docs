export const foundationSections = [
 {id:'typography',label:'Типографика',title:'Typography'},
 {id:'radius',label:'Скругления',title:'Radius'},
 {id:'spacing',label:'Отступы',title:'Spacing'},
 {id:'borders',label:'Толщина рамки',title:'Border width'},
 {id:'motion',label:'Анимация',title:'Motion'},
 {id:'opacity',label:'Прозрачность',title:'Opacity'},
];
export function foundationCatalog(source){
 const entries=[];
 for(const [collection,modes] of Object.entries({foundation:['Mode 1'],semantic:['Light','Dark']}))for(const mode of modes){
  function visit(node,parts=[]){
   if(node&&typeof node==='object'&&Object.hasOwn(node,'$value')){
    if(node.$type==='color')return;
    const section=collection==='foundation'?(parts[0]==='font'?'typography':parts[0]==='space'?'spacing':parts[1]==='radius'?'radius':parts[1]==='width'?'borders':null):parts[0]==='opacity'?'opacity':['duration','easing'].includes(parts[0])?'motion':null;
    const path=parts.join('/');
    if(section)entries.push({collection,mode,path,key:`${collection}|${mode}|${path}`,authored:String(node.$value),type:node.$type,section,group:section==='typography'?parts.slice(0,2).join('/'):parts.slice(0,-1).join('/'),component:null});return;
   }
   if(node&&typeof node==='object')for(const [name,child]of Object.entries(node))if(!name.startsWith('$'))visit(child,[...parts,name]);
  }visit(source.$collections[collection].$modes[mode]);
 }
 return entries;
}
export function validateFoundationValue(item,value){
 if(typeof value!=='string'||!value.trim()||value.length>120)throw Error('Введите значение токена.');
 if(item.type==='number'){
  const n=Number(value);if(!Number.isFinite(n))throw Error('Value must be a finite number.');
  let min=0,max=256;
  if(item.section==='radius')max=999;
  if(item.section==='borders')max=16;
  if(item.section==='motion')max=10000;
  if(item.section==='opacity')max=1;
  if(item.path.endsWith('/size')){min=1;max=128;}
  if(item.path.endsWith('/lineHeight'))min=1;
  if(item.path.endsWith('/letterSpacing')){min=-16;max=32;}
  if(n<min||n>max)throw Error('Value must be between '+min+' and '+max+'.');return n;
 }
 if(item.path.endsWith('/weight')&&!['Regular','Medium','Semibold','Bold','Italic','Light Italic'].includes(value))throw Error('Unsupported font weight.');
 if(item.path==='font/family'&&!/^[\p{L}\p{N} _-]{1,80}$/u.test(value))throw Error('Введите имя font family без CSS-кода.');
 if(item.path.startsWith('easing/')){
  const m=/^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/.exec(value);
  if(value!=='linear'&&(!m||m.slice(1).some(n=>!Number.isFinite(Number(n)))||[Number(m[1]),Number(m[3])].some(n=>n<0||n>1)||[Number(m[2]),Number(m[4])].some(n=>Math.abs(n)>5)))throw Error('Use linear or cubic-bezier(x1, y1, x2, y2).');
 }
 return value;
}
