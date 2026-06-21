import type { ShelfLayer, Product } from '@/types';
import ShelfLayerComponent from './ShelfLayer';

interface ShelfProps {
  layers: ShelfLayer[];
  products: Product[];
  title?: string;
}

export default function Shelf({ layers, products, title = '实训货架' }: ShelfProps) {
  const sortedLayers = [...layers].sort((a, b) => b.level - a.level);

  return (
    <div className="bg-gradient-to-b from-amber-700 to-amber-900 p-4 rounded-2xl shadow-2xl">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-amber-100">{title}</h3>
        <div className="h-1 w-24 mx-auto bg-amber-500 rounded-full mt-1" />
      </div>

      <div className="bg-gradient-to-b from-amber-800 to-amber-950 p-3 rounded-xl shadow-inner">
        {sortedLayers.map((layer, index) => (
          <div key={layer.id}>
            <ShelfLayerComponent layer={layer} products={products} />
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
