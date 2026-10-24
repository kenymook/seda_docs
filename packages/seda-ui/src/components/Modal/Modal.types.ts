import type {DialogHTMLAttributes,ReactNode,RefObject} from 'react';

export type ModalVariant = 'default' | 'confirmation' | 'alert' | 'fullscreen';
export type ModalSize = 's' | 'm' | 'l' | 'xl';
export interface ModalChangeDetails {
  reason: 'close-button' | 'escape' | 'scrim' | 'native';
  returnValue: string;
}
export interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>,
  'open'|'title'|'role'|'aria-modal'|'tabIndex'|'onClose'|'onCancel'|'onBeforeToggle'|'onToggle'|'popover'|'closedBy'> {
  /** Controlled visibility; native close requests do not override the owner. */
  open: boolean;
  onOpenChange: (open: boolean, details: ModalChangeDetails) => void;
  title: string;
  description?: ReactNode;
  variant?: ModalVariant;
  /** Surface width, independent of the provider's control density. */
  size?: ModalSize;
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnScrimClick?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Supply a logical destination when the opening trigger can be removed. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}
