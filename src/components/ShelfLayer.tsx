import { useCallback } from 'react';
import { useDrop } from '@/hooks/useDrag';
import { useGameStore } from '@/store/useGameStore';
import type { ShelfLayer as ShelfLayerType, Product } from '@/types';
import { getLayerProducts } from '@/utils/validator';
import ProductCard from './ProductCard';
import { X, GripVertical, Zap } from 'lucide-react';

interface ShelfLayerProps {
  layer: ShelfLayerType;
  products: Product[];
  showWeight?: boolean;
  isOverweight?: boolean;
  disabled?: boolean;
  onDrop: (
    data: unknown,
    type: string,
    position: number,
    targetPlacedId?: string
  ) => void;
  onRemove: (placedId: string) => void;
  onDragOver?: (e: React.DragEvent, position: number) => void;
}

export default function ShelfLayerComponent({
  layer,
  products,
  showWeight = true,
  isOverweight = false,
  disabled = false,
  onDrop,
  onRemove,
  onDragOver,
}: ShelfLayerProps) {
  const {
    placedProducts,
    getEffectiveMaxWeight,
    getEffectiveMaxStock,
    isPositionSkipped,
    validationResult,
  } = useGameStore();

  const layerProducts = getLayerProducts(placedProducts, layer.id);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const currentWeight = layerProducts.reduce((sum, pp) => {
    const product = productMap.get(pp.productId);
    return sum + (product?.weight || 0);
  }, 0);

  const effectiveMaxWeight = getEffectiveMaxWeight(layer);
  const weightPercent = Math.min((currentWeight / effectiveMaxWeight) * 100, 100);
  const isWeightWarning = currentWeight > effectiveMaxWeight;

  const hasWeightBoost = useGameStore
    .getState()
    .activeEffects.some(
      (e) => e.effectType === 'weight_boost' && e.targetLayerId === layer.id
    );

  const handleDrop = useCallback(
    (
      data: unknown,
      type: string,
      position: number,
      targetPlacedId?: string
    ) => {
      if (disabled) return;
      const currentCount = layerProducts.length;
      if (type === 'product' && currentCount >= layer.maxSlots) return;
      onDrop(data, type, position, targetPlacedId);
    },
    [disabled, layer.maxSlots, layerProducts.length, onDrop]
  );

  const { isOver, hoverPosition, dropHandlers, setSlotRef } = useDrop({
    acceptTypes: ['product', 'placed_product'],
    onDrop: handleDrop,
    onDragOver,
    layerId: layer.id,
    maxSlots: layer.maxSlots,
    placedProducts,
  });

  const handleRemove = (e: React.MouseEvent, placedId: string) => {
    e.stopPropagation();
    if (disabled) return;
    onRemove(placedId);
  };

  const slots = Array.from({ length: layer.maxSlots }, (_, i) => i);

  const getWeightBarColor = () => {
    if (isWeightWarning || isOverweight) return 'bg-red-500';
    if (weightPercent > 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const isHighlightOverweight =
    validationResult?.highlights.overweightLayers.includes(layer.id) || isOverweight;

  const isMisplacedProduct = (placedId: string) =>
    validationResult?.highlights.misplacedProducts.includes(placedId);

  const isOverstockProduct = (placedId: string) =>
    validationResult?.highlights.overstockProducts.includes(placedId);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-amber-900">{layer.name}</span>
          {layer.isVisual && (
            <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
              👁 视觉位
            </span>
          )}
          {layer.isBottom && (
            <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-medium">
              ⬇ 底层
            </span>
          )}
          {layer.isExtra && (
            <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
              ✨ 万能层
            </span>
          )}
          {hasWeightBoost && (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              已加固
            </span>
          )}
        </div>
        {showWeight && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${getWeightBarColor()}`}
                style={{ width: `${weightPercent}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono ${
                isWeightWarning || isOverweight ? 'text-red-600 font-bold' : 'text-amber-700'
              }`}
            >
              {currentWeight}/{effectiveMaxWeight}g
            </span>
          </div>
        )}
      </div>

      <div
        className={[
          'relative min-h-[100px]',
          'bg-gradient-to-b from-amber-100 to-amber-200',
          'border-2 border-amber-400 rounded-lg',
          'px-3 py-2',
          'transition-all duration-200',
          isOver ? 'border-orange-500 bg-orange-100 shadow-inner' : '',
          layer.isBottom ? 'border-b-4 border-b-amber-600' : '',
          isHighlightOverweight
            ? 'layer-overweight animate-blink-warning animate-shake-overweight'
            : '',
          layer.isExtra
            ? 'bg-gradient-to-b from-purple-100 to-purple-200 border-purple-400'
            : '',
          disabled ? 'opacity-60 pointer-events-none' : '',
        ].join(' ')}
        {...dropHandlers}
      >
        <div className="flex flex-wrap gap-2 items-center justify-start min-h-[80px]">
          {slots.map((slotIndex) => {
            const placed = layerProducts.find((p) => p.position === slotIndex);
            const product = placed ? productMap.get(placed.productId) : null;
            const isHoverSlot = hoverPosition === slotIndex;
            const isInsertBefore =
              hoverPosition !== null && hoverPosition <= slotIndex;

            return (
              <div
                key={slotIndex}
                ref={setSlotRef(slotIndex)}
                className={[
                  'w-16 h-20 rounded-lg border-2 border-dashed',
                  'flex items-center justify-center',
                  'transition-all duration-200',
                  placed ? 'border-transparent' : 'border-amber-300 bg-amber-50/50',
                  isOver && !placed ? 'border-orange-400 bg-orange-50' : '',
                  isHoverSlot && !placed
                    ? 'border-blue-400 bg-blue-50 scale-105 shadow-lg'
                    : '',
                  isInsertBefore && !placed && hoverPosition === slotIndex
                    ? 'ml-2'
                    : '',
                ].join(' ')}
              >
                {placed && product && (
                  <div
                    className={`
                      relative w-full h-full flex items-center justify-center group
                      ${isHoverSlot ? 'opacity-50 scale-95' : ''}
                    `}
                  >
                    <ProductCard
                      product={product}
                      size="sm"
                      placedId={placed.id}
                      isMisplaced={!layer.isExtra && isMisplacedProduct(placed.id)}
                      isOverstock={!layer.isExtra && isOverstockProduct(placed.id)}
                      draggable={!disabled}
                      effectiveMaxStock={getEffectiveMaxStock(product)}
                      showStockBadge={false}
                    />
                    <button
                      onClick={(e) => handleRemove(e, placed.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3" />
                    </div>
                    {!layer.isExtra && isPositionSkipped(product.id) && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        豁免
                      </div>
                    )}
                  </div>
                )}
                {!placed && isHoverSlot && isOver && (
                  <div className="w-14 h-18 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50/50 flex items-center justify-center">
                    <span className="text-blue-400 text-2xl">+</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isOver && layerProducts.length >= layer.maxSlots && !layer.isExtra && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center rounded-lg">
            <span className="text-red-600 font-medium text-sm">槽位已满</span>
          </div>
        )}

        {layer.isExtra && (
          <div className="absolute top-1 right-2 text-[10px] text-purple-600 font-medium">
            不受规则约束
          </div>
        )}
      </div>
    </div>
  );
}
