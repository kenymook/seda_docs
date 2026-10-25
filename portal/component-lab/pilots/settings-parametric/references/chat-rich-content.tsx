import {Card,Table,Text} from '@seda-ai/ui';
import formatting from './chat-inline-data.json';
import type{RichBlock}from'./chat-model';
const inline=formatting as Record<string,{text:string;bold?:boolean;code?:boolean}[]>;
function SourceText({text}:{text:string}){const runs=inline[text];return runs?<>{runs.map((run,index)=>{const content=run.code?<code>{run.text}</code>:run.text;return run.bold?<strong key={index}>{content}</strong>:<span key={index}>{content}</span>;})}</>:<>{text}</>;}
/** Source strings stay immutable; entity and table surfaces use installed SEDA APIs. */
export function RichContent({blocks,onFile}:{blocks:RichBlock[];onFile:()=>void}){
 return <div className="chat-rich-content">{blocks.map((block,index)=>{
  const key=block.sourceId??index;
  if(block.kind==='heading')return <Text as="h2" variant="heading/section" key={key} data-source-node={block.sourceId}><SourceText text={block.text}/></Text>;
  if(block.kind==='list'){
   const items=block.items.map((text,i)=><li key={i}><Text variant="body/large"><SourceText text={text}/></Text></li>);
   return block.ordered?<ol key={key}>{items}</ol>:<ul key={key}>{items}</ul>;
  }
  if(block.kind==='table')return <Table key={key} label="Таблица исходного сообщения" density="medium" bordered minWidth={320}
   columns={(block.rows[0]??[]).map((text,i)=>({key:String(i),header:text||'Колонка '+(i+1),type:'text' as const,render:(row:{cells:string[]})=><Text variant="body/default"><SourceText text={row.cells[i]??''}/></Text>}))}
   data={block.rows.slice(1).map((cells,i)=>({id:String(i),cells}))} rowKey={row=>row.id}/>;
  if(block.kind==='excerpt')return <section key={key} className="chat-source-excerpt" aria-label="Текст исходного примера"><header><Text variant="caption/default">Текст · исторический пример</Text></header><RichContent blocks={block.blocks} onFile={onFile}/></section>;
  if(block.kind==='file')return <Card key={key} className="chat-source-file" variant="clickable" interactiveStrategy="whole-card" title={block.text} description="4 файла · HTML, CSS, JavaScript · сведения об исходном примере" onClick={onFile}/>;
  return <Text as="p" variant="body/large" key={key} data-source-node={block.sourceId}><SourceText text={block.text}/></Text>;
 })}</div>;
}
