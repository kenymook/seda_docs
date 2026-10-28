import React,{useEffect,useMemo,useState} from 'react';
import {Button,Select,SedaProvider,Text,TextField} from '@seda-ai/ui';
import {foundationCatalog,foundationSections} from './foundation-model.mjs';
import {applyWorkbenchEdits} from './token-workbench-model.mjs';
import {createTokenResolver} from '../../../../packages/seda-contracts/src/tokens.mjs';
import {compileTypography,createTypographyBindings,typographyRoles} from '../../../../packages/seda-contracts/src/typography.mjs';

type Entry={collection:string;mode:string;path:string;key:string;authored:string;type:string;section:string;group:string};
type Props={area:string;source:any;original:any;theme:'Light'|'Dark';edits:Record<string,string>;setEdits:React.Dispatch<React.SetStateAction<Record<string,string>>>;footer:React.ReactNode};
const displayValue=(value:string|number,type?:string)=>typeof value==='number'||type==='number'?String(Number(Number(value).toFixed(4))):String(value);
const weights:Record<string,number>={Regular:400,Medium:500,Semibold:600,Bold:700,Italic:400,'Light Italic':300};
const unit=(item:Entry)=>item.section==='opacity'?'ratio':item.path.startsWith('duration/')?'ms':item.type==='number'?'px':'';
function read(source:any,item:Entry){return createTokenResolver(source).resolve({collection:item.collection,path:item.path.split('/'),expectedType:item.type},{theme:item.mode==='Dark'?'Dark':'Light'}).value;}

export function FoundationStudio({area,source,original,theme,edits,setEdits,footer}:Props){
 const all=useMemo(()=>foundationCatalog(original) as Entry[],[original]);
 const entries=all.filter(item=>item.section===area&&(item.collection!=='semantic'||item.mode===theme)).sort((a,b)=>a.type==='number'&&b.type==='number'&&area!=='typography'?Number(a.authored)-Number(b.authored):a.path.localeCompare(b.path,undefined,{numeric:true}));
 const [selectedKey,setSelectedKey]=useState(''),[query,setQuery]=useState(''),[value,setValue]=useState(''),[error,setError]=useState(''),[play,setPlay]=useState(0);
 const selected=entries.find(item=>item.key===selectedKey)??entries.find(item=>['space/m','border/radius/m','border/width/m','font/body/base/size','duration/base','opacity/disabled'].includes(item.path))??entries[0];
 const authored=selected?(edits[selected.key]??selected.authored):'';
 useEffect(()=>{setValue(displayValue(authored,selected?.type));setError('');},[selected?.key,authored]);
 const descriptor=foundationSections.find(item=>item.id===area)!;
 const library=[...new Set(entries.map(item=>area==='typography'||area==='motion'?item.group:item.path))];
 const active=area==='typography'||area==='motion'?selected?.group:selected?.path;
 const shown=entries.filter(item=>(query?item.path.toLowerCase().includes(query.toLowerCase()):area==='typography'||area==='motion'?item.group===active:true));
 const metric=selected?read(source,selected):0;
 const typography=useMemo(()=>compileTypography(createTokenResolver(source)),[source]);
 const bindings=useMemo(()=>createTypographyBindings(typography).vars,[typography]);
 const selectedFont=selected?.path.split('/')[1];
 const selectedStyle=selected?.path.split('/')[2]??'base';
 const font=source.$collections.foundation.$modes['Mode 1'].font;
 const style=font[selectedFont]?.[selectedStyle]??font.body.base;
 const customType:React.CSSProperties={fontFamily:JSON.stringify(font.family.$value)+',system-ui,sans-serif',fontSize:style.size.$value,lineHeight:style.lineHeight.$value+'px',letterSpacing:style.letterSpacing.$value,fontWeight:weights[style.weight.$value],fontStyle:style.weight.$value.includes('Italic')?'italic':'normal'};
 const roles=Object.entries(typographyRoles).filter(([,parts])=>selected?.path==='font/family'||parts[0]===selectedFont&&parts[1]===selectedStyle).slice(0,5);
 const semantic=source.$collections.semantic.$modes[theme];
 const duration=selected?.path.startsWith('duration/')?Number(metric):semantic.duration.base.$value;
 const easing=selected?.path.startsWith('easing/')?String(metric):semantic.easing.standard.$value;
 function save(){if(!selected)return;try{const next={...edits};if(value===selected.authored)delete next[selected.key];else next[selected.key]=value;applyWorkbenchEdits(original,next);setEdits(next);setError('');}catch(e){setError(e instanceof Error?e.message:String(e));}}
 function revert(){if(!selected)return;setEdits(previous=>{const next={...previous};delete next[selected.key];return next;});setValue(displayValue(selected.authored,selected.type));setError('');}
 function pick(item:Entry){setSelectedKey(item.key);setError('');}
 return <>
  <aside className="studio-library"><div className="studio-panel-heading">{descriptor.title}</div><div className="studio-library-search"><TextField label="Поиск основ" placeholder="Поиск…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="studio-library-items">{library.filter(name=>name.toLowerCase().includes(query.toLowerCase())).map(name=><button key={name} aria-pressed={active===name} onClick={()=>{const item=entries.find(item=>(area==='typography'||area==='motion'?item.group:item.path)===name)!;pick(item);setQuery('');}}>{name}</button>)}</div></aside>
  <main className="studio-canvas"><div className="studio-canvas-scroll studio-foundations"><h1>{descriptor.title}</h1><section className="studio-foundation-preview" aria-label={descriptor.title+' preview'}><div className="studio-artboard-title">{selected?.path}<span>{unit(selected)}</span></div>
   {area==='typography'?<SedaProvider className="studio-type-specimen" style={bindings as React.CSSProperties}><p className="studio-type-custom" style={customType}>Рабочее пространство<br/>The quick brown fox · 0123456789</p>{roles.map(([role])=><div className="studio-type-role" key={role}><code>{role}</code><Text as="p" variant={role as React.ComponentProps<typeof Text>['variant']}>Задачи, проекты и команда</Text></div>)}</SedaProvider>:area==='radius'?<div className="studio-radius-specimen" style={{borderRadius:Number(metric)}}><span>{metric} px</span></div>:area==='spacing'?<div className="studio-spacing-specimen" style={{padding:Number(metric),gap:Number(metric)}}><div>Navigation</div><div>Workspace</div><div>Inspector</div></div>:area==='borders'?<div className="studio-border-specimen" style={{borderWidth:Number(metric)}}>Border · {metric} px</div>:area==='opacity'?<div className="studio-opacity-specimen"><div style={{opacity:Number(metric)}}>SEDA<br/>{Math.round(Number(metric)*100)}%</div></div>:<><div className="studio-motion-track"><div key={play} className={play?'studio-motion-marker is-playing':'studio-motion-marker'} style={{animationDuration:duration+'ms',animationTimingFunction:easing}}/></div><Button variant="secondary" onClick={()=>setPlay(x=>x+1)}>Воспроизвести</Button><p>{duration} ms · {easing}</p></>}
  </section><div className="studio-semantic-table"><table aria-label={descriptor.title+' tokens'}><thead><tr><th>Token</th><th>Value</th><th>Type</th></tr></thead><tbody>{shown.map(item=><tr className="studio-token-row" key={item.key} aria-selected={item.key===selected?.key} onClick={()=>pick(item)}><td><button onClick={()=>pick(item)}>{item.path}</button>{Object.hasOwn(edits,item.key)&&<span className="studio-token-modified">•</span>}</td><td><code>{displayValue(read(source,item))} {unit(item)}</code></td><td><code>{item.type}</code></td></tr>)}</tbody></table>{!shown.length&&<p className="studio-table-empty">No tokens found</p>}</div></div>{footer}</main>
  <aside className="studio-inspector" aria-label="Foundation inspector"><div className="studio-panel-heading">{descriptor.title}</div><section className="studio-inspector-section"><p className="studio-foundation-path">{selected?.path}</p><form onSubmit={e=>{e.preventDefault();save();}}>{selected?.path.endsWith('/weight')?<Select label="fontWeight" value={value} options={Object.keys(weights).filter(v=>selectedStyle==='emphasis'||!v.includes('Italic')).map(v=>({value:v,label:v}))} onValueChange={v=>setValue(String(v))}/>:<TextField key={selected?.key} label={'Value'+(unit(selected)?' · '+unit(selected):'')} type={selected?.type==='number'?'number':'text'} step="any" value={value} onChange={e=>setValue(e.target.value)}/>}{error&&<p role="alert" className="studio-foundation-error">{error}</p>}<Button type="submit" variant="secondary" disabled={value===displayValue(authored,selected?.type)}>Применить</Button></form><Button variant="text" disabled={!selected||!Object.hasOwn(edits,selected.key)} onClick={revert}>Вернуть исходное значение</Button></section><details className="studio-inspector-section studio-foundation-source"><summary>Source</summary><code className="studio-foundation-path">{selected?.collection}/{selected?.mode}/{selected?.path}</code><p>Исходное значение: {displayValue(selected?.authored??'',selected?.type)} {unit(selected)}</p><p>{area==='typography'?'Роли SEDA Text пересчитываются общим компилятором типографики.':'Образец показывает выбранный токен основы. Геометрия готовых контролов задаётся их профилями.'}</p><p>После применения значение автоматически сохраняется в общей базе. Выпуск библиотеки остаётся отдельным действием.</p></details></aside>
 </>;
}
