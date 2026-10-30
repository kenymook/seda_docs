import {useRef,useState} from 'react';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {Button} from '../Button';
import {Text} from '../Text';
import type {ChatBubbleContent} from './ChatBubble.types';
type Media = Extract<ChatBubbleContent,{contentType:'image'|'audio'}>;
/** Keyed by source in ChatBubble. Events only belong to the committed resource node. */
export function ChatBubbleMedia(props:Media) {
  const image=props.contentType==='image', content=props.content;
  const [state,setState]=useState<'pending'|'ready'|'error'>(image?'pending':'ready');
  const [attempt,setAttempt]=useState(0);
  const resource=useRef<HTMLImageElement|HTMLAudioElement|null>(null);
  const retry=useRef<HTMLButtonElement>(null),pending=useRef(false),restore=useRef(false);
  function finish(node:EventTarget,status:'ready'|'error') {
    if(node!==resource.current)return;
    pending.current=false;restore.current=status==='ready'&&document.activeElement===retry.current;setState(status);
  }
  useBrowserLayoutEffect(()=>{
    const node=resource.current;
    if(node instanceof HTMLImageElement&&node.complete)finish(node,node.naturalWidth>0?'ready':'error');
  },[attempt,content.src]);
  useBrowserLayoutEffect(()=>{if(state==='ready'&&restore.current){restore.current=false;resource.current?.focus();}},[state]);
  const retryResource=()=>{if(pending.current)return;pending.current=true;setState('pending');setAttempt(n=>n+1);};
  return <div className="seda-chat-bubble__media">
    {props.contentType==='image'?<>
      <div className="seda-chat-bubble__image-frame" style={{aspectRatio:props.content.width+'/'+props.content.height}} aria-busy={state==='pending'||undefined}>
        <img key={attempt} ref={node=>{resource.current=node;}} tabIndex={-1} src={content.src} alt={props.content.alt} width={props.content.width} height={props.content.height} onLoad={e=>finish(e.currentTarget,'ready')} onError={e=>finish(e.currentTarget,'error')} style={{visibility:state==='ready'?'visible':'hidden'}}/>
        {state==='pending'&&<Text variant="caption/default" className="seda-chat-bubble__media-pending">{props.content.loadingLabel}</Text>}
      </div>
      {props.content.caption&&<Text as="p" variant="caption/default">{props.content.caption}</Text>}
    </>:<>
      <Text as="strong" variant="label/default">{props.content.name}</Text>
      <audio key={attempt} ref={node=>{resource.current=node;}} tabIndex={0} aria-label={props.content.name} controls preload="metadata" src={content.src} onLoadedMetadata={e=>finish(e.currentTarget,'ready')} onError={e=>finish(e.currentTarget,'error')}/>
      {'text'in props.content.transcript?<details><summary><Text variant="label/default">{props.content.transcript.label}</Text></summary><Text as="p" variant="body/large">{props.content.transcript.text}</Text></details>:<Text as="p" variant="caption/default">{props.content.transcript.unavailableLabel}</Text>}
    </>}
    <div role="status" aria-live="polite" aria-atomic="true" className={state==='error'?'seda-chat-bubble__media-error':'seda-visually-hidden'}>{state==='error'?content.errorLabel:''}</div>
    {(state==='error'||attempt>0&&state==='pending')&&<Button ref={retry} variant="secondary" loading={state==='pending'} onClick={retryResource}>{content.retryLabel}</Button>}
  </div>;
}
