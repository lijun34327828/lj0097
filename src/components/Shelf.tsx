import { useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { ShelfLayer as ShelfLayerType, Product } from '@/types';
import ShelfLayerComponent from './ShelfLayer';

interface ShelfProps {
  layers: ShelfLayerType[];
  products: Product[];
  title?: string;
  disabled?: boolean;
  onDrop: (
    data: unknown,
    type: string,
    layerId: string,
    position: number,
    targetPlacedId?: string
  ) => void;
  onRemove: (placedId: string) => void;
}

export default function Shelf({
  layers,
  products,
  title = '实训货架',
  disabled = false,
  onDrop,
  onRemove,
}: ShelfProps) {
  const { getEffectiveLayers } = useGameStore();

  const effectiveLayers = getEffectiveLayers(layers);
  const sortedLayers = [...effectiveLayers].sort((a, b) => b.level - a.level);

  const handleLayerDrop = useCallback(
    (
      layerId: string,
      data: unknown,
      type: string,
      position: number,
      targetPlacedId?: string
    ) => {
      onDrop(data, type, layerId, position, targetPlacedId);
    },
    [onDrop]
  );

  return (
    <div className="bg-gradient-to-b from-amber-700 to-amber-900 p-4 rounded-2xl shadow-2xl">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-amber-100">{title}</h3>
        <div className="h-1 w-24 mx-auto bg-amber-500 rounded-full mt-1" />
      </div>

      <div className="bg-gradient-to-b from-amber-800 to-amber-950 p-3 rounded-xl shadow-inner">
        {sortedLayers.map((layer, index) => (
          <div key={layer.id}>
            <ShelfLayerComponent
              layer={layer}
              products={products}
              disabled={disabled}
              onDrop={(data, type, position, targetPlacedId) =>
                handleLayerDrop(layer.id, data, type, position, targetPlacedId)
              }
              onRemove={onRemove}
            />
            {index < sortedLayers.length - 1 && (
              <div className="h-3 bg-gradient-to-b from-amber-900 via-amber-950 to-amber-900 mx-2 rounded-sm" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between text-amber-300 text-xs">
        <span>👆 拖拽商品到货架上</span>
        <span>点击 ❌ 移除商品</span>
      </div>
    </div>
  );
}
