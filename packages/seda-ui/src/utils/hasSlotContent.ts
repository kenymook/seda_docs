import {Fragment,isValidElement} from 'react';
import type {ReactNode} from 'react';
/** Only known empty nodes are omitted; opaque application components keep ownership. */
export function hasSlotContent(value:ReactNode):boolean {
  if(value==null||typeof value==='boolean')return false;
  if(typeof value==='string')return !!value.trim();
  if(Array.isArray(value))return value.some(hasSlotContent);
  if(isValidElement<{children?:ReactNode}>(value)&&value.type===Fragment)return hasSlotContent(value.props.children);
  return true;
}
