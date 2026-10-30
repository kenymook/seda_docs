import type {HTMLAttributes,MouseEventHandler,ReactNode} from 'react';
import type {SedaSize} from '../../types';

export interface TopBarItem {
  id:string;
  label:string;
  href:string;
  icon?:ReactNode;
  selected?:boolean;
  disabled?:boolean;
  target?:'_self'|'_blank';
  /** Native anchor event; routing and business guards stay with the application. */
  onClick?:MouseEventHandler<HTMLAnchorElement>;
}
interface TopBarBase extends Omit<HTMLAttributes<HTMLElement>,'title'|'children'> {
  label:string;
  as?:'header'|'div';
  state?:'default'|'scrolled';
  size?:SedaSize;
  /** Approved foundation gutter; aligns the header with its owning workspace. */
  gutter?:'compact'|'regular'|'wide';
  brand?:ReactNode;
  title?:ReactNode;
  /** Semantic role for string titles. Rich titles own their document outline. */
  titleAs?:'span'|'h1'|'h2'|'h3';
  leading?:ReactNode;
  breadcrumbs?:ReactNode;
  search?:ReactNode;
  actions?:ReactNode;
  userMenu?:ReactNode;
}
type Navigation = {
  items:readonly TopBarItem[];
  navigationLabel:string;
} & (
  {navigationPresentation?:'inline';navigationTriggerLabel?:never;navigationCloseLabel?:never} |
  {navigationPresentation:'dialog';navigationTriggerLabel:string;navigationCloseLabel:string}
);
type NoNavigation = {items?:never;navigationLabel?:never;navigationPresentation?:never;navigationTriggerLabel?:never;navigationCloseLabel?:never};
/** Component slots own nested controls; no cloning or silent hidden action overflow. */
export type TopBarProps = TopBarBase & (
  ({variant:'application'} & Navigation) |
  ({variant?:'app-bar'|'page-header'} & NoNavigation) |
  ({variant:'transparent'} & (Navigation|NoNavigation))
);
