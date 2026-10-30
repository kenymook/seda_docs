import {forwardRef} from 'react';
import type {EmptyStateProps} from './EmptyState.types';
import {useSedaSize} from '../../foundation/SedaProvider';
import {Button} from '../Button';
import {Text} from '../Text';
import {cx} from '../../utils/classNames';
const nonempty=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0;
/** Data and announcements belong to the host; actions are actual SEDA Buttons. */
export const EmptyState=forwardRef<HTMLDivElement,EmptyStateProps>(function EmptyState({title,description,reason='no-data',size:sizeProp,media,primaryAction,secondaryAction,headingLevel=3,className,...props},ref){
 const size=useSedaSize(sizeProp);
 if(!nonempty(title)||description!==undefined&&!nonempty(description)||!['no-data','no-results','no-access','error','first-time'].includes(reason)||![2,3,4,5,6].includes(headingLevel)||!['s','m','l','xl'].includes(size))throw new TypeError('EmptyState requires a title and supported reason, size and heading level');
 for(const action of [primaryAction,secondaryAction])if(action&&(!nonempty(action.label)||typeof action.onAction!=='function'))throw new TypeError('EmptyState actions require a label and callback');
 if(secondaryAction&&!primaryAction)throw new TypeError('EmptyState secondary action requires a primary action');
 return <div {...props} ref={ref} className={cx('seda-empty-state',className)} data-size={size} data-reason={reason}>
  {media!=null&&<span className="seda-empty-state__media" aria-hidden="true">{media}</span>}
  <Text as={('h'+headingLevel) as 'h2'|'h3'|'h4'|'h5'|'h6'} variant="heading/compact" className="seda-empty-state__title">{title}</Text>
  {description&&<Text as="p" variant="body/default" className="seda-empty-state__description">{description}</Text>}
  {(primaryAction||secondaryAction)&&<div className="seda-empty-state__actions">{primaryAction&&<Button size={size} variant="primary" type="button" onClick={primaryAction.onAction}>{primaryAction.label}</Button>}{secondaryAction&&<Button size={size} variant="secondary" type="button" onClick={secondaryAction.onAction}>{secondaryAction.label}</Button>}</div>}
 </div>;
});
