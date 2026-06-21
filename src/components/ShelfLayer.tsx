import { useDrop } from '@/hooks/useDrag';
import { useGameStore } from '@/store/useGameStore';
import type { ShelfLayer, Product } from '@/types';
import { getLayerProducts } from '@/utils/validator';
import { X, GripVertical } from 'lucide-react';

interface ShelfLayerProps {
  layer: ShelfLayer;
  products: Product[];
  showWeight?: boolean;
}

export default function ShelfLayerComponent({ layer, products, showWeight = true }: ShelfLayerProps) {
  const { placedProducts, addPlacedProduct, removePlacedProduct } = useGameStore();
  const layerProducts = getLayerProducts(placedProducts, layer.id);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const currentWeight = layerProducts.reduce((sum, pp) => {
    const product = productMap.get(pp.productId);
    return sum + (product?.weight || 0);
  }, 0);

  const weightPercent = Math.min((currentWeight / layer.maxWeight) * 100, 100);
  const isWeightWarning = currentWeight > layer.maxWeight;

  const { isOver, dropHandlers } = useDrop({
    acceptTypes: ['product'],
    onDrop: (data) => {
      const { productId } = data as { productId: string };
      const position = layerProducts.length;
      if (position >= layer.maxSlots) return;

      addPlacedProduct({
        id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId,
        shelfLayerId: layer.id,
        position,
      });
    },
  });

  const handleRemove = (e: React.MouseEvent, placedId: string) => {
    e.stopPropagation();
    removePlacedProduct(placedId);
  };

  const slots = Array.from({ length: layer.maxSlots }, (_, i) => i);

  const getWeightBarColor = () => {
    if (isWeightWarning) return 'bg-red-500';
    if (weightPercent > 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

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
        </div>
        {showWeight && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${getWeightBarColor()}`}
                style={{ width: `${weightPercent}%` }}
              />
            </div>
            <span className={`text-xs font-mono ${isWeightWarning ? 'text-red-600' : 'text-amber-700'}`}>
              {currentWeight}/{layer.maxWeight}g
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
        ].join(' ')}
        {...dropHandlers}
      >
        <div className="flex flex-wrap gap-2 items-center justify-start min-h-[80px]">
          {slots.map((slotIndex) => {
            const placed = layerProducts.find((p) => p.position === slotIndex);
            const product = placed ? productMap.get(placed.productId) : null;

            return (
              <div
                key={slotIndex}
                className={[
                  'w-16 h-20 rounded-lg border-2 border-dashed',
                  'flex items-center justify-center',
                  'transition-all duration-200',
                  placed ? 'border-transparent' : 'border-amber-300 bg-amber-50/50',
                  isOver && !placed ? 'border-orange-400 bg-orange-50' : '',
                ].join(' ')}
              >
                {placed && product && (
                  <div className="relative w-full h-full flex items-center justify-center group">
                    <span className="text-3xl drop-shadow-sm">{product.emoji}</span>
                    <button
                      onClick={(e) => handleRemove(e, placed.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isOver && layerProducts.length >= layer.maxSlots && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center rounded-lg">
            <span className="text-red-600 font-medium text-sm">槽位已满</span>
          </div>
        )}
      </div>
    </div>
  );
}
