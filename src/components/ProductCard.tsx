import { useDrag } from '@/hooks/useDrag';
import { useGameStore } from '@/store/useGameStore';
import type { Product } from '@/types';
import { Flame, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  count?: number;
  isDragging?: boolean;
  draggable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  placedId?: string;
  isMisplaced?: boolean;
  isOverstock?: boolean;
  showStockBadge?: boolean;
  effectiveMaxStock?: number;
}

export default function ProductCard({
  product,
  count,
  draggable = true,
  size = 'md',
  placedId,
  isMisplaced = false,
  isOverstock = false,
  showStockBadge = false,
  effectiveMaxStock,
}: ProductCardProps) {
  const { setDragging, setDragPreview } = useGameStore();

  const dragType = placedId ? 'placed_product' : 'product';
  const dragData = placedId
    ? { placedId, productId: product.id }
    : { productId: product.id };

  const { isDragging, dragHandlers } = useDrag({
    type: dragType,
    data: dragData,
    enabled: draggable,
    onDragStart: () => {
      setDragging(true);
      setDragPreview({
        productId: product.id,
        targetLayerId: null,
        targetPosition: null,
        sourcePlacedId: placedId,
      });
    },
    onDragEnd: () => {
      setDragging(false);
      setDragPreview(null);
    },
  });

  const sizeClasses = {
    sm: 'w-16 h-20 text-2xl',
    md: 'w-20 h-24 text-3xl',
    lg: 'w-24 h-28 text-4xl',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3 text-[10px]',
    md: 'w-3.5 h-3.5 text-xs',
    lg: 'w-4 h-4 text-sm',
  };

  const displayCount = typeof count === 'number' ? count : 0;
  const maxStock = effectiveMaxStock ?? product.maxStock;
  const isOverStockLimit = displayCount >= maxStock;

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        ${sizeClasses[size]}
        bg-gradient-to-br from-amber-50 to-orange-100
        border-2 border-amber-300 rounded-xl
        cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out
        hover:scale-105 hover:shadow-lg hover:border-orange-400
        ${isDragging ? 'opacity-50 scale-95 rotate-3' : ''}
        ${!draggable ? 'cursor-default hover:scale-100 hover:shadow-none' : ''}
        ${isMisplaced ? 'product-misplaced animate-flash-misplaced' : ''}
        ${isOverstock ? 'product-overstock' : ''}
        select-none
      `}
      draggable={draggable}
      {...dragHandlers}
    >
      <span className="mb-1 drop-shadow-sm">{product.emoji}</span>
      <span className={`text-xs font-medium text-amber-900 truncate w-full text-center px-1 ${size === 'sm' ? 'text-[10px]' : ''}`}>
        {product.name}
      </span>

      <div className="absolute -top-1 -right-1 flex gap-0.5">
        {product.isHot && (
          <div className={`${iconSizeClasses[size]} bg-red-500 text-white rounded-full flex items-center justify-center p-0.5`}>
            <Flame className="w-full h-full" />
          </div>
        )}
        {product.isHeavy && (
          <div className={`${iconSizeClasses[size]} bg-amber-700 text-white rounded-full flex items-center justify-center p-0.5`}>
            <Package className="w-full h-full" />
          </div>
        )}
      </div>

      {showStockBadge && (
        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
          {displayCount}/{maxStock}
        </div>
      )}

      {!showStockBadge && typeof count === 'number' && (
        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
          {count}
        </div>
      )}

      {isOverStockLimit && !placedId && (
        <div className="absolute inset-0 bg-gray-500/50 rounded-xl flex items-center justify-center">
          <span className="text-xs text-white font-bold bg-red-500 px-2 py-0.5 rounded">已达上限</span>
        </div>
      )}
    </div>
  );
}
