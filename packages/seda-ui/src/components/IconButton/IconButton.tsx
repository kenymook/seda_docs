import {useTooltip} from '../Tooltip/Tooltip';
import { useSedaSize } from "../../foundation/SedaProvider";
import { useCallback, forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { IconButtonProps } from "./IconButton.types";

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      disabled,
      icon,
      loading = false,
      onClick,
      selected,
      size: sizeProp,
      tooltip,
      type = "button",
      variant = "secondary",
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const isBlocked = disabled || loading;
    const hint=useTooltip({content:tooltip??'',disabled:!tooltip||!!disabled,...(props['aria-describedby']?{describedBy:props['aria-describedby']}:{})});
    const anchor=hint.trigger.ref;
    const bindRef=useCallback((node:HTMLButtonElement|null)=>{
      anchor(node);
      if(typeof ref==='function'){
        const cleanup:unknown=ref(node);
        if(typeof cleanup==='function')return()=>{anchor(null);cleanup();};
      }else if(ref)ref.current=node;
    },[anchor,ref]);

    return (
      <>
      <button
        {...props}
        aria-busy={loading ? true : props["aria-busy"]}
        aria-disabled={loading ? true : props["aria-disabled"]}
        aria-pressed={selected}
        className={cx("seda-icon-button", className)}
        data-loading={loading ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        data-size={size}
        data-variant={variant}
        disabled={disabled}
        onClick={(event) => {
          if (isBlocked) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        ref={bindRef}
        aria-describedby={hint.trigger['aria-describedby']}
        title={tooltip ? undefined : props.title}
        type={type}
      >
        <span aria-hidden="true" className="seda-icon-button__icon">
          {loading ? <span className="seda-icon-button__spinner" /> : icon}
        </span>
      </button>
      {hint.surface}
      </>
    );
  },
);

IconButton.displayName = "IconButton";
