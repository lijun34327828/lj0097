import { useCallback, useState, useRef } from 'react';
import type { PlacedProduct } from '@/types';

export type DragDataType =
  | { type: 'product'; data: { productId: string } }
  | { type: 'placed_product'; data: { placedId: string; productId: string } };

interface UseDragOptions<T = unknown> {
  type: string;
  data: T;
  enabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDrag<T = unknown>({
  type,
  data,
  enabled = true,
  onDragStart,
  onDragEnd,
}: UseDragOptions<T>) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.dataTransfer.setData('application/json', JSON.stringify({ type, data }));
      e.dataTransfer.effectAllowed = 'move';
      setIsDragging(true);
      onDragStart?.();
    },
    [type, data, enabled, onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

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
  onDrop?: (data: unknown, type: string, position: number, targetPlacedId?: string) => void;
  onDragOver?: (e: React.DragEvent, position: number) => void;
  onDragLeave?: () => void;
  onDragEnter?: (data: unknown, type: string) => void;
  layerId: string;
  maxSlots: number;
  placedProducts: PlacedProduct[];
}

export function useDrop({
  acceptTypes,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragEnter,
  layerId,
  maxSlots,
  placedProducts,
}: UseDropOptions) {
  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const calculatePosition = useCallback(
    (e: React.DragEvent): number => {
      const container = e.currentTarget as HTMLElement;
      const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[];

      if (slots.length === 0) return 0;

      const containerRect = container.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;

      let position = 0;
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const slotRect = slot.getBoundingClientRect();
        const slotCenter = slotRect.left + slotRect.width / 2 - containerRect.left;

        if (relativeX < slotCenter) {
          position = i;
          break;
        }
        position = i + 1;
      }

      const currentCount = placedProducts.filter((p) => p.shelfLayerId === layerId).length;
      return Math.min(position, currentCount, maxSlots - 1);
    },
    [layerId, maxSlots, placedProducts]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsOver(true);

      const position = calculatePosition(e);
      setHoverPosition(position);
      onDragOver?.(e, position);
    },
    [calculatePosition, onDragOver]
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

        if (rawData) {
          const raw = e.dataTransfer.getData('application/json');
          if (raw) {
            const parsed = JSON.parse(raw);
            onDragEnter?.(parsed.data, parsed.type);
          }
        }
      } catch {
        setCanDrop(false);
      }
      setIsOver(true);
    },
    [acceptTypes, onDragEnter]
  );

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
    setCanDrop(false);
    setHoverPosition(null);
    onDragLeave?.();
  }, [onDragLeave]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      setCanDrop(false);
      setHoverPosition(null);

      try {
        const rawData = e.dataTransfer.getData('application/json');
        if (!rawData) return;

        const parsed = JSON.parse(rawData);
        const { type, data } = parsed;

        if (acceptTypes && !acceptTypes.includes(type)) {
          return;
        }

        const position = calculatePosition(e);

        const targetPlaced = placedProducts.find(
          (p) => p.shelfLayerId === layerId && p.position === position
        );

        onDrop?.(data, type, position, targetPlaced?.id);
      } catch {
        // ignore parse errors
      }
    },
    [acceptTypes, calculatePosition, layerId, placedProducts, onDrop]
  );

  const dropHandlers = {
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const setSlotRef = (index: number) => (el: HTMLDivElement | null) => {
    slotRefs.current[index] = el;
  };

  return {
    isOver,
    canDrop,
    hoverPosition,
    dropHandlers,
    setSlotRef,
  };
}
