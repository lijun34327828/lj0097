import { useCallback, useState, useRef } from 'react';

interface UseDragOptions<T = unknown> {
  type: string;
  data: T;
  enabled?: boolean;
}

export function useDrag<T = unknown>({ type, data, enabled = true }: UseDragOptions<T>) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.dataTransfer.setData('application/json', JSON.stringify({ type, data }));
      e.dataTransfer.effectAllowed = 'move';
      setIsDragging(true);
    },
    [type, data, enabled]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const dragHandlers = {
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  };

  return {
    isDragging,
    dragHandlers,
  };
}

interface UseDropOptions {
  acceptTypes?: string[];
  onDrop?: (data: unknown, type: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
}

export function useDrop({ acceptTypes, onDrop, onDragOver, onDragLeave }: UseDropOptions) {
  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsOver(true);
      onDragOver?.(e);
    },
    [onDragOver]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const rawData = e.dataTransfer.types.includes('application/json');
        if (acceptTypes && rawData) {
          setCanDrop(true);
        } else if (!acceptTypes) {
          setCanDrop(true);
        }
      } catch {
        setCanDrop(false);
      }
      setIsOver(true);
    },
    [acceptTypes]
  );

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
    setCanDrop(false);
    onDragLeave?.();
  }, [onDragLeave]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      setCanDrop(false);

      try {
        const rawData = e.dataTransfer.getData('application/json');
        if (!rawData) return;

        const parsed = JSON.parse(rawData);
        const { type, data } = parsed;

        if (acceptTypes && !acceptTypes.includes(type)) {
          return;
        }

        onDrop?.(data, type);
      } catch {
        // ignore parse errors
      }
    },
    [acceptTypes, onDrop]
  );

  const dropHandlers = {
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  return {
    isOver,
    canDrop,
    dropHandlers,
  };
}
