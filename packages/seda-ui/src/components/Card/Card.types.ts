import type {HTMLAttributes, MouseEventHandler, ReactNode} from 'react';

interface CardBase extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title' | 'onClick'> {
  title: ReactNode;
  description?: string;
  metadata?: ReactNode;
  children?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  mediaAspectRatio?: number;
  size?: 'compact' | 'medium' | 'large';
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  titleLines?: number;
  descriptionLines?: number;
  loading?: boolean;
  loadingLabel?: string;
  as?: 'article' | 'section' | 'li' | 'div';
}
interface ContentCard extends CardBase {
  variant?: 'default' | 'media' | 'compact';
  interactiveStrategy?: 'actions-only';
  selected?: never;
  disabled?: never;
  onSelectedChange?: never;
  href?: never;
  onClick?: never;
}
interface SelectableCard extends CardBase {
  variant: 'selectable';
  interactiveStrategy: 'selectable';
  selected: boolean;
  onSelectedChange: (selected:boolean) => void;
  disabled?: boolean;
  href?: never;
  onClick?: never;
}
/** Whole-card actions are text-only so the native link/button cannot contain another control. */
type ClickableCard = Omit<CardBase, 'title' | 'metadata' | 'children' | 'actions' | 'media' | 'status' | 'as' | 'headingLevel'> & {
  variant: 'clickable';
  interactiveStrategy: 'whole-card';
  title: string;
  metadata?: string;
  children?: never;
  actions?: never;
  media?: never;
  status?: never;
  as?: never;
  headingLevel?: never;
  selected?: never;
  onSelectedChange?: never;
  disabled?: boolean;
} & ({href:string; onClick?:never} | {href?:never; onClick:MouseEventHandler<HTMLButtonElement>});
export type CardProps = ContentCard | SelectableCard | ClickableCard;
