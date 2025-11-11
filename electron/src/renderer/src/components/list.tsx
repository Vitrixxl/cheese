import * as React from "react";
import { cn } from "@/lib/utils";

export type ScrollDirection = "top-to-bottom" | "bottom-to-top";

export interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollDirection?: ScrollDirection;
  onMaxScroll?: (direction: ScrollDirection) => void;
}

export interface ListHandle {
  getElement: () => HTMLDivElement | null;
  scrollToTop: (behavior?: ScrollBehavior) => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

const SCROLL_THRESHOLD = 2;

export const List = React.forwardRef<ListHandle, ListProps>(function List(
  {
    className,
    children,
    scrollDirection = "top-to-bottom",
    onMaxScroll,
    onScroll,
    ...rest
  },
  ref,
) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const hasNotifiedMax = React.useRef(false);

  const scrollToTop = React.useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const node = containerRef.current;
      if (!node) return;

      const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
      const nextTop = scrollDirection === "top-to-bottom" ? 0 : maxScrollTop;

      node.scrollTo({ top: nextTop, behavior });
    },
    [scrollDirection],
  );

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const node = containerRef.current;
      if (!node) return;

      const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
      const nextTop = scrollDirection === "top-to-bottom" ? maxScrollTop : 0;

      node.scrollTo({ top: nextTop, behavior });
    },
    [scrollDirection],
  );

  const checkMaxScroll = React.useCallback(() => {
    const node = containerRef.current;
    if (!node) return;

    const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
    const isAtMax =
      scrollDirection === "top-to-bottom"
        ? node.scrollTop >= maxScrollTop - SCROLL_THRESHOLD
        : node.scrollTop <= SCROLL_THRESHOLD;

    if (isAtMax) {
      if (!hasNotifiedMax.current) {
        hasNotifiedMax.current = true;
        onMaxScroll?.(scrollDirection);
      }
    } else {
      hasNotifiedMax.current = false;
    }
  }, [scrollDirection, onMaxScroll]);

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      checkMaxScroll();
      onScroll?.(event);
    },
    [checkMaxScroll, onScroll],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      getElement: () => containerRef.current,
      scrollToTop,
      scrollToBottom,
    }),
    [scrollToBottom, scrollToTop],
  );

  React.useEffect(() => {
    hasNotifiedMax.current = false;

    if (scrollDirection === "bottom-to-top") {
      scrollToBottom();
    } else {
      scrollToTop();
    }

    checkMaxScroll();
  }, [scrollDirection, scrollToBottom, scrollToTop, checkMaxScroll]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col overflow-y-auto",
        scrollDirection === "bottom-to-top" && "justify-end",
        className,
      )}
      data-scroll-direction={scrollDirection}
      onScroll={handleScroll}
      {...rest}
    >
      {children}
    </div>
  );
});

List.displayName = "List";

interface UseListScrollOptions {
  behavior?: ScrollBehavior;
}

interface UseListScrollResult {
  scrollToTop: (behavior?: ScrollBehavior) => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  getElement: () => HTMLDivElement | null;
}

export function useListScroll(
  options: UseListScrollOptions = {},
): UseListScrollResult {
  const { behavior = "smooth" } = options;
  const listRef = React.useRef<ListHandle | null>(null);

  const scrollToTop = React.useCallback(
    (nextBehavior?: ScrollBehavior) => {
      listRef.current?.scrollToTop(nextBehavior ?? behavior);
    },
    [behavior],
  );

  const scrollToBottom = React.useCallback(
    (nextBehavior?: ScrollBehavior) => {
      listRef.current?.scrollToBottom(nextBehavior ?? behavior);
    },
    [behavior],
  );

  const getElement = React.useCallback(
    () => listRef.current?.getElement() ?? null,
    [listRef],
  );

  return React.useMemo(
    () => ({
      ref: listRef,
      scrollToTop,
      scrollToBottom,
      getElement,
    }),
    [scrollToTop, scrollToBottom, getElement],
  );
}
