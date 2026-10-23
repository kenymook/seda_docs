import {forwardRef} from 'react';
import type {HTMLAttributes} from 'react';
import {cx} from '../../utils/classNames';
export const textVariants=['display/large','display/medium','display/small','heading/page','heading/section','heading/panel','heading/compact','body/large','body/default','body/small','body/xsmall','label/default','label/small','label/xsmall','caption/default','caption/tiny','caption/micro','code/default','code/small','metric/large','metric/default','metric/small','metric/label'] as const;
export type TextVariant=typeof textVariants[number];
type TextTag='span'|'p'|'div'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'code'|'strong'|'em'|'small';
export interface TextProps extends HTMLAttributes<HTMLElement>{variant?:TextVariant;as?:TextTag}
/** Visual role and document outline are independent; headings require an explicit semantic tag. */
export const Text=forwardRef<HTMLElement,TextProps>(({variant='body/default',as='span',className,...props},ref)=>{
 if(!textVariants.includes(variant)||!['span','p','div','h1','h2','h3','h4','h5','h6','code','strong','em','small'].includes(as))throw new TypeError('Unsupported Text variant or element');
 const Element=as;
 return <Element {...props} ref={ref as never} className={cx('seda-text',className)} data-seda-text={variant}/>;
});
Text.displayName='Text';
