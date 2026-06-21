import { useState } from 'react';
import { useItemStore } from '@/store/useItemStore';
import { useGameStore } from '@/store/useGameStore';
import type { Item, Level } from '@/types';
import { ITEM_CONFIG } from '@/types';
import { X, Check, Package } from 'lucide-react';

interface ItemPanelProps {
  level: Level;
  onUseItem: (itemId: string, targetLayerId?: string, targetProductId?: string) => void;
  disabled?: boolean;
}

type SelectingState =
  | { type: null }
  | { type: 'weight_boost'; itemId: string }
  | { type: 'position_skip'; itemId: string }
  | { type: 'stock_boost'; itemId: string }
  | { type: 'extra_layer'; itemId: string };

export default function ItemPanel({ level, onUseItem, disabled }: ItemPanelProps) {
  const { items } = useItemStore();
  const { activeEffects } = useGameStore();
  const [selectingState, setSelectingState] = useState<SelectingState>({ type: null });
  const [showConfirm, setShowConfirm] = useState<Item | null>(null);

  const availableItems = items.filter((item) => item.remaining > 0);

  const handleItemClick = (item: Item) => {
    if (disabled || item.remaining <= 0) return;

    const config = ITEM_CONFIG[item.id];
    if (!config) return;

    if (config.effect === 'extra_layer') {
      setShowConfirm(item);
    } else {
      setSelectingState({ type: config.effect, itemId: item.id });
    }
  };

  const handleConfirmExtraLayer = () => {
    if (!showConfirm) return;
    onUseItem(showConfirm.id);
    setShowConfirm(null);
  };

  const handleLayerSelect = (layerId: string) => {
    if (selectingState.type !== 'weight_boost') return;

    const hasBoost = activeEffects.some(
      (e) => e.effectType === 'weight_boost' && e.targetLayerId === layerId
    );
    if (hasBoost) return;

    const itemId = (selectingState as { type: string; itemId: string }).itemId;
    onUseItem(itemId, layerId);
    setSelectingState({ type: null });
  };

  const handleProductSelect = (productId: string) => {
    if (selectingState.type === 'position_skip') {
      const hasSkip = activeEffects.some(
        (e) => e.effectType === 'position_skip' && e.targetProductId === productId
      );
      if (hasSkip) return;
      const itemId = (selectingState as { type: string; itemId: string }).itemId;
      onUseItem(itemId, undefined, productId);
    } else if (selectingState.type === 'stock_boost') {
      const boostCount = activeEffects.filter(
        (e) => e.effectType === 'stock_boost' && e.targetProductId === productId
      ).length;
      if (boostCount >= 3) return;
      const itemId = (selectingState as { type: string; itemId: string }).itemId;
      onUseItem(itemId, undefined, productId);
    }
    setSelectingState({ type: null });
  };

  const cancelSelection = () => {
    setSelectingState({ type: null });
    setShowConfirm(null);
  };

  const getItemInstructions = () => {
    switch (selectingState.type) {
      case 'weight_boost':
        return '👆 点击要加固的货架层';
      case 'position_skip':
        return '👆 点击要豁免位置规则的爆款商品';
      case 'stock_boost':
        return '👆 点击要扩充库存的商品';
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          <span>道具背包</span>
        </h3>

        {selectingState.type && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">{getItemInstructions()}</span>
            <button
              onClick={cancelSelection}
              className="text-blue-500 hover:text-blue-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {availableItems.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无可用道具</p>
            <p className="text-xs mt-1">通关解锁道具</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {availableItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={disabled}
                className={`
                  relative p-3 rounded-xl border-2 transition-all text-left
                  ${disabled
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:border-purple-400 hover:shadow-md cursor-pointer'
                  }
                  ${selectingState.type && 'itemId' in selectingState && selectingState.itemId === item.id
                    ? 'ring-2 ring-purple-500 border-purple-500'
                    : ''
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                <div className="absolute top-1 right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.remaining}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectingState.type === 'weight_boost' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">选择货架层</h4>
          <div className="space-y-2">
            {level.shelfLayers
              .filter((l) => !l.isExtra)
              .map((layer) => {
                const hasBoost = activeEffects.some(
                  (e) => e.effectType === 'weight_boost' && e.targetLayerId === layer.id
                );
                return (
                  <button
                    key={layer.id}
                    onClick={() => handleLayerSelect(layer.id)}
                    disabled={hasBoost}
                    className={`
                      w-full p-2 rounded-lg text-left text-sm transition-all
                      ${hasBoost
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                      }
                    `}
                  >
                    <span className="font-medium">{layer.name}</span>
                    {hasBoost && <span className="ml-2 text-xs">（已加固）</span>}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {(selectingState.type === 'position_skip' || selectingState.type === 'stock_boost') && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">
            {selectingState.type === 'position_skip' ? '选择爆款商品' : '选择商品'}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {level.products
              .filter((p) => selectingState.type !== 'position_skip' || p.isHot)
              .map((product) => {
                const hasEffect = activeEffects.some(
                  (e) =>
                    e.effectType === selectingState.type && e.targetProductId === product.id
                );
                const boostCount = activeEffects.filter(
                  (e) =>
                    e.effectType === 'stock_boost' && e.targetProductId === product.id
                ).length;
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product.id)}
                    disabled={hasEffect || (selectingState.type === 'stock_boost' && boostCount >= 3)}
                    className={`
                      p-2 rounded-lg text-center transition-all
                      ${hasEffect || (selectingState.type === 'stock_boost' && boostCount >= 3)
                        ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'bg-white border border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                      }
                    `}
                  >
                    <span className="text-2xl block">{product.emoji}</span>
                    <span className="text-xs text-gray-600">{product.name}</span>
                    {selectingState.type === 'stock_boost' && boostCount > 0 && (
                      <span className="text-[10px] text-purple-600 block">+{boostCount}</span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-5xl block mb-3">{showConfirm.emoji}</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">使用 {showConfirm.name}</h3>
              <p className="text-gray-600">{showConfirm.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelSelection}
                className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmExtraLayer}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认使用
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
