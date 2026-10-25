import {forwardRef,useId} from 'react';
import {cx} from '../../utils/classNames';
import {hasSlotContent} from '../../utils/hasSlotContent';
import {useSedaSize} from '../../foundation/SedaProvider';
import {Text} from '../Text';
import {Button} from '../Button';
import {Link} from '../Link';
import {Avatar} from '../Avatar';
import {ChatBubbleMedia} from './ChatBubbleMedia';
import type {ChatBubbleProps} from './ChatBubble.types';
const nonempty=(value:unknown):value is string=>typeof value==='string'&&!!value.trim();
/** One message; request, thread, clipboard and scroll ownership remain with the caller. */
export const ChatBubble=forwardRef<HTMLElement,ChatBubbleProps>(({
  author,authorVisibility='visible',avatar,size:sizeProp,as:Element='article',sender,aiLabel,
  appearance='bubble',groupPosition='single',sourceLabel,timestamp,dateTime,actions,reactions,attachments,
  contentType,content,deliveryStatus,streaming=false,announcementPolicy,statusLabel,recovery,
  className,...props
},ref)=>{
  const size=useSedaSize(sizeProp),authorId=useId();
  if(!nonempty(author)||!['incoming','outgoing','ai','system'].includes(sender)||!['s','m','l','xl'].includes(size)||!['article','li','div'].includes(Element)||!['bubble','neutral','plain'].includes(appearance)||!['single','first','middle','last'].includes(groupPosition)||!['visible','accessible'].includes(authorVisibility))throw new TypeError('Unsupported ChatBubble identity, view or size');
  if(sender==='ai'?!nonempty(aiLabel):aiLabel!==undefined)throw new TypeError('AI messages require an explicit source label');
  if(announcementPolicy!==undefined&&!['off','status-only'].includes(announcementPolicy)||streaming&&(!nonempty(statusLabel)||announcementPolicy===undefined||deliveryStatus)||announcementPolicy==='status-only'&&!nonempty(statusLabel))throw new TypeError('Streaming requires a status label and explicit controlled announcement policy');
  if(deliveryStatus&&(!['sending','sent','delivered','read','edited','error'].includes(deliveryStatus)||!nonempty(statusLabel)))throw new TypeError('Delivery status requires readable text');
  if(deliveryStatus==='error'?(!recovery||!nonempty(recovery.label)||typeof recovery.onClick!=='function'):recovery!==undefined)throw new TypeError('Message error requires a real recovery action');
  if(dateTime!==undefined&&(!nonempty(timestamp)||!nonempty(dateTime)||Number.isNaN(Date.parse(dateTime))))throw new TypeError('dateTime requires a visible timestamp and a valid date');
  if(!['text','rich','code','file','image','audio'].includes(contentType))throw new TypeError('Unsupported ChatBubble content model');
  if(contentType==='text'?!nonempty(content):contentType==='rich'?!hasSlotContent(content):false)throw new TypeError('ChatBubble content must not be empty');
  const model={contentType,content} as ChatBubbleProps;
  let body;
  switch(model.contentType){
    case 'text':body=<Text as="div" variant="body/large" className="seda-chat-bubble__text">{model.content}</Text>;break;
    case 'rich':body=model.content;break;
    case 'code':
      if(!nonempty(model.content.code)||!nonempty(model.content.languageLabel)||!nonempty(model.content.copyLabel)||typeof model.content.onCopy!=='function')throw new TypeError('Code requires language and owned copy action');
      body=<div className="seda-chat-bubble__code"><div className="seda-chat-bubble__row"><Text variant="label/default">{model.content.languageLabel}</Text><Button variant="secondary" onClick={model.content.onCopy}>{model.content.copyLabel}</Button></div><pre><Text as="code" variant="code/default">{model.content.code}</Text></pre></div>;break;
    case 'file':{
      const file=model.content,action=file.action;
      if(!nonempty(file.name)||!nonempty(file.description)||!action||!nonempty(action.label)||!!action.href===(typeof action.onClick==='function')||action.href!==undefined&&!nonempty(action.href))throw new TypeError('File requires metadata and exactly one real action');
      body=<div className="seda-chat-bubble__file"><Text as="strong" variant="label/default">{file.name}</Text><Text as="p" variant="body/small">{file.description}</Text>{action.href?<Link href={action.href}>{action.label}</Link>:<Button variant="secondary" onClick={action.onClick}>{action.label}</Button>}</div>;break;
    }
    case 'image':
      if(!nonempty(model.content.src)||typeof model.content.alt!=='string'||!model.content.alt.trim()&&!nonempty(model.content.caption)||![model.content.width,model.content.height].every(n=>Number.isFinite(n)&&n>0)||![model.content.loadingLabel,model.content.errorLabel,model.content.retryLabel].every(nonempty))throw new TypeError('Image requires reserved geometry, alternative and recovery labels');
      body=<ChatBubbleMedia key={'image:'+model.content.src} {...model}/>;break;
    case 'audio':
      if(!nonempty(model.content.src)||!nonempty(model.content.name)||![model.content.errorLabel,model.content.retryLabel].every(nonempty)||!model.content.transcript||('text'in model.content.transcript?(!nonempty(model.content.transcript.text)||!nonempty(model.content.transcript.label)):!nonempty(model.content.transcript.unavailableLabel)))throw new TypeError('Audio requires native controls, transcript policy and recovery labels');
      body=<ChatBubbleMedia key={'audio:'+model.content.src} {...model}/>;break;
  }
  const visualAuthor=authorVisibility==='visible'&&groupPosition!=='middle'&&groupPosition!=='last';
  return <Element {...props} ref={ref as never} className={cx('seda-chat-bubble',className)} data-size={size} data-sender={sender} data-appearance={appearance} data-group={groupPosition} data-streaming={streaming||undefined} aria-labelledby={props['aria-label']?undefined:authorId}>
    {visualAuthor&&avatar&&<Avatar {...avatar} name={author} alt="" className="seda-chat-bubble__avatar"/>}
    <div className="seda-chat-bubble__main">
      <div className={visualAuthor||aiLabel||sourceLabel?'seda-chat-bubble__identity':'seda-visually-hidden'}>
        <Text as="strong" variant="label/default" id={authorId} className={visualAuthor?undefined:'seda-visually-hidden'}>{author}</Text>
        {aiLabel&&<Text variant="caption/default" className="seda-chat-bubble__source">{aiLabel}</Text>}
        {sourceLabel&&<Text variant="caption/default" className="seda-chat-bubble__source">{sourceLabel}</Text>}
      </div>
      <div className="seda-chat-bubble__surface"><div className="seda-chat-bubble__body" aria-live="off" aria-busy={streaming||undefined}>{body}</div>{hasSlotContent(attachments)&&<div className="seda-chat-bubble__attachments">{attachments}</div>}</div>
      <div className={timestamp||nonempty(statusLabel)?'seda-chat-bubble__metadata':'seda-visually-hidden'}>
        {timestamp&&<time dateTime={dateTime}><Text variant="caption/default">{timestamp}</Text></time>}
        <Text variant="caption/default" role={announcementPolicy==='status-only'||deliveryStatus==='error'?'status':undefined} aria-live={announcementPolicy==='status-only'||deliveryStatus==='error'?'polite':'off'} aria-atomic="true" className="seda-chat-bubble__status">{statusLabel??''}</Text>
        {deliveryStatus==='error'&&recovery&&<Button variant="secondary" disabled={recovery.disabled} loading={recovery.loading??false} onClick={recovery.onClick}>{recovery.label}</Button>}
      </div>
      {hasSlotContent(reactions)&&<div className="seda-chat-bubble__reactions">{reactions}</div>}
      {hasSlotContent(actions)&&<div className="seda-chat-bubble__actions">{actions}</div>}
    </div>
  </Element>;
});
ChatBubble.displayName='ChatBubble';
