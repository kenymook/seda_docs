import React from 'react';
import {Button,Text,Select,Toggle,Tabs} from '@seda-ai/ui';
import {DraftProperty} from './sandbox-property';
import * as m from './webflow-model';
import type {NodeMeasurement} from './webflow-preview';

const groups:[string,[m.StyleKey,string][]][]=[
 ['Layout',[['display','Display'],['flexDirection','Direction'],['justifyContent','Justify'],['alignItems','Align'],['gap','Gap'],['gridColumns','Columns']]],
 ['Spacing',[['marginTop','Margin top'],['marginRight','Margin right'],['marginBottom','Margin bottom'],['marginLeft','Margin left'],['paddingTop','Padding top'],['paddingRight','Padding right'],['paddingBottom','Padding bottom'],['paddingLeft','Padding left']]],
 ['Size',[['width','Width'],['height','Height'],['minWidth','Min width'],['minHeight','Min height'],['maxWidth','Max width'],['maxHeight','Max height'],['overflow','Overflow']]],
 ['Position',[['position','Position'],['top','Top'],['right','Right'],['bottom','Bottom'],['left','Left'],['zIndex','Z-index'],['verticalAlign','Vertical align']]],
 ['Typography',[['fontFamily','Font'],['fontWeight','Weight'],['fontSize','Font size'],['lineHeight','Line height'],['color','Text color'],['textAlign','Text align'],['textDecoration','Decoration']]],
 ['Backgrounds',[['backgroundColor','Background color']]],
 ['Borders',[['borderWidth','Border width'],['borderColor','Border color'],['borderRadius','Border radius']]],
 ['Effects',[['opacity','Opacity']]],
];
const options:Partial<Record<m.StyleKey,readonly (string|number)[]>>={display:['block','flex','grid','inline-block','none'],position:['static','relative','absolute','fixed'],flexDirection:['row','column'],justifyContent:['flex-start','center','flex-end','space-between'],alignItems:['stretch','flex-start','center','flex-end','baseline'],overflow:['visible','hidden','auto','scroll'],verticalAlign:['baseline','top','middle','bottom'],fontFamily:['Inter','Arial','Georgia','monospace'],fontWeight:[400,500,600,700],textAlign:['left','center','right','justify'],textDecoration:['none','underline','line-through']};
interface Props {document:m.AuthorDocument;page:m.AuthorPage;node:m.AuthorNode;bp:m.Breakpoint;measurement:NodeMeasurement|null;locked:boolean;onPending:(id:string,pending:boolean)=>void;command:(next:m.AuthorDocument)=>boolean}
export function AuthorInspector({document,page,node,bp,measurement,locked,onPending,command}:Props){
 const identity=page.id+':'+node.id+':'+bp,rule=document.rules[node.className][bp]??{};
 function field(key:m.StyleKey,label:string){
  const resolved=m.resolveProperty(document,page,node.id,key,bp),value=m.formatStyleValue(resolved.value),own=Object.hasOwn(rule,key),source=resolved.chain.at(-1)!;
  const apply=(text:string)=>command(m.setStyle(document,node.className,bp,key,m.parseStyleInput(key,text)));
  return <div className="wf-property" key={key} data-css-property={key} data-overridden={own}>
   {options[key]?<Select id={'wf-style-'+key} label={label} value={value} disabled={locked} options={options[key]!.map(value=>({value:String(value),label:String(value)}))} onValueChange={value=>{if(typeof value==='string')apply(value);}}/>:<DraftProperty id={'wf-style-'+key} label={label} value={value} identity={identity} mixed={false} disabled={locked} onPending={onPending} maxLength={80} onCommit={apply}/>}
   <div className="wf-property-origin"><Text as="span" variant="caption/tiny" title={source.path?.join('/')}>{own?bp:source.kind==='inherit'?'Inherited':source.kind==='recipe'?'Recipe':source.kind==='rule'?'Cascaded':'Default'}</Text><Button variant="ghost" disabled={!own||locked} aria-label={'Reset '+label} onClick={()=>command(m.setStyle(document,node.className,bp,key,undefined))}>Reset</Button></div>
  </div>;
 }
 const style=<>
  <section className="wf-selector"><Text as="p" variant="caption/default">Style selector · {bp}</Text><Select id="wf-class" label="CSS class" value={node.className} disabled={locked} options={Object.keys(document.rules).map(value=>({value,label:value}))} onValueChange={className=>{if(typeof className==='string')command(m.updateNode(document,page.id,node.id,{className}));}}/><Text as="p" variant="caption/default">{document.pages.flatMap(p=>p.nodes).filter(n=>n.className===node.className).length} element(s) share this class</Text></section>
  {groups.map(([title,fields])=><details key={title} open className="wf-inspector-section"><summary><Text as="span" variant="label/default">{title}</Text></summary><div className="wf-fields">{fields.map(([key,label])=>field(key,label))}</div></details>)}
  <section className="wf-computed"><Text as="h3" variant="heading/panel">Computed · browser</Text>{measurement?<><Text as="p" variant="code/small" id="wf-computed-size">{measurement.width.toFixed(2)} × {measurement.height.toFixed(2)} px</Text><Text as="p" variant="code/small" id="wf-computed-type">font {measurement.fontSize} / {measurement.lineHeight}</Text></>:<Text as="p" variant="caption/default">No rendered element</Text>}<Text as="p" variant="caption/default">Размеры в CSS px до canvas zoom. Панель редактирует реконструированный документ, а не токены SEDA.</Text></section>
  <details className="wf-inspector-section"><summary>Typography provenance</summary><pre id="wf-type-provenance">{JSON.stringify(m.resolveProperty(document,page,node.id,'fontSize',bp).chain,null,2)}</pre></details>
 </>;
 const settings=<section className="wf-node-settings">
  <DraftProperty id="wf-node-name" label="Element name" value={node.name} mixed={false} identity={identity} disabled={locked} onPending={onPending} onCommit={name=>command(m.updateNode(document,page.id,node.id,{name}))}/>
  <DraftProperty id="wf-node-text" label="Text content" value={node.text} mixed={false} identity={identity} disabled={locked||!['text','slide','component','container','section'].includes(node.kind)} multiline maxLength={10000} onPending={onPending} onCommit={text=>command(m.updateNode(document,page.id,node.id,{text}))}/>
  <Select id="wf-node-tag" label="HTML tag" value={node.tag} disabled={locked} options={['main','div','section','nav','footer','p','span','h1','h2','h3'].map(value=>({value,label:value}))} onValueChange={tag=>command(m.updateNode(document,page.id,node.id,{tag:tag as m.AuthorNode['tag']}))}/>
  <DraftProperty id="wf-node-html-id" label="HTML ID" value={node.htmlId} mixed={false} identity={identity} disabled={locked} onPending={onPending} maxLength={80} onCommit={htmlId=>command(m.updateNode(document,page.id,node.id,{htmlId}))}/>
  <DraftProperty id="wf-node-label" label="Accessible label" value={node.ariaLabel} mixed={false} identity={identity} disabled={locked} onPending={onPending} maxLength={300} onCommit={ariaLabel=>command(m.updateNode(document,page.id,node.id,{ariaLabel}))}/>
  <Toggle id="wf-node-visible" label="Visible" checked={node.visible} disabled={locked} onCheckedChange={visible=>command(m.updateNode(document,page.id,node.id,{visible}))}/>
  <Text as="p" variant="caption/default">Изменения применяются Enter или при выходе из поля; многострочный текст — Ctrl/Cmd+Enter. Escape отменяет черновик.</Text>
 </section>;
 return <aside className="wf-inspector" aria-label="Style inspector"><header><Text as="h2" variant="heading/panel">{node.name}</Text></header><Tabs id="wf-inspector-tabs" label="Element inspector" items={[{value:'style',label:'Style',content:style},{value:'settings',label:'Settings',content:settings},{value:'interactions',label:'Interactions',content:<Text as="p" variant="body/default" className="wf-empty">Interactions и исполняемые embeds ещё не реализованы.</Text>}]}/></aside>;
}
