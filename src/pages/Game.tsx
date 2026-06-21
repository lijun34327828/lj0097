import { useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLevelStore } from '@/store/useLevelStore';
import { useGameStore, persistCurrentState } from '@/store/useGameStore';
import { useItemStore } from '@/store/useItemStore';
import { getProductCount } from '@/utils/validator';
import { formatTime } from '@/utils/scoring';
import { loadGameState, hasPersistedState, clearGameState } from '@/utils/persistence';
import Shelf from '@/components/Shelf';
import ProductCard from '@/components/ProductCard';
import ValidationPanel from '@/components/ValidationPanel';
import ItemPanel from '@/components/ItemPanel';
import ScorePanel from '@/components/ScorePanel';
import UndoRedoBar from '@/components/UndoRedoBar';
import type { HistoryActionType } from '@/types';
import {
  ArrowLeft,
  RotateCcw,
  Check,
  ChevronRight,
  Flame,
  Package,
  Scale,
  Clock,
  AlertTriangle,
} from 'lucide-react';

declare global {
  interface Window {
    __currentLevel?: ReturnType<typeof useLevelStore.getState>['levels'][number];
  }
}

export default function Game() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  const { getLevel, completeLevel, getNextLevelId } = useLevelStore();
  const {
    placedProducts,
    validationResult,
    isSubmitted,
    isFailed,
    remainingTime,
    isPaused,
    scoreResult,
    correctionCount,
    initLevel,
    addPlacedProduct,
    removePlacedProduct,
    movePlacedProduct,
    swapProducts,
    useItem: applyItemEffect,
    resetLevel,
    clearAll,
    startTimer,
    tickTimer,
    pauseTimer,
    resumeTimer,
    validateRealTime,
    submitLevel,
    getEffectiveMaxStock,
    pushHistory,
  } = useGameStore();

  const { items, useItem, restoreFromPersisted, resetAll: resetItems } = useItemStore();

  const level = levelId ? getLevel(levelId) : undefined;

  useEffect(() => {
    if (level) {
      window.__currentLevel = level;
    }
    return () => {
      delete window.__currentLevel;
    };
  }, [level]);

  useEffect(() => {
    if (!levelId || !level) return;

    const persisted = hasPersistedState(levelId) ? loadGameState() : null;

    if (persisted && persisted.levelId === levelId) {
      restoreFromPersisted(persisted.itemRemaining);
      initLevel(levelId, persisted);
    } else {
      resetItems();
      initLevel(levelId);
    }

    return () => {
      clearAll();
    };
  }, [levelId, level, initLevel, clearAll, restoreFromPersisted, resetItems]);

  useEffect(() => {
    if (!level) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [level, tickTimer]);

  useEffect(() => {
    if (!level) return;

    if (placedProducts.length > 0 || validationResult) {
      validateRealTime(level);
    }
  }, [placedProducts, level, validateRealTime, validationResult]);

  useEffect(() => {
    if (!level || isSubmitted || isPaused) return;

    const shouldSave =
      placedProducts.length > 0 ||
      useGameStore.getState().activeEffects.length > 0;

    if (shouldSave && remainingTime !== null && remainingTime > 0) {
      persistCurrentState(items);
    }
  }, [
    placedProducts,
    level,
    isSubmitted,
    isPaused,
    items,
    remainingTime,
  ]);

  useEffect(() => {
    if (isFailed && remainingTime === 0) {
      clearGameState();
    }
  }, [isFailed, remainingTime]);

  const getItemRemainingMap = useCallback(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      map[item.id] = item.remaining;
    });
    return map;
  }, [items]);

  const handleHistoryPush = useCallback(
    (type: HistoryActionType, description: string) => {
      pushHistory(type, description, getItemRemainingMap());
    },
    [pushHistory, getItemRemainingMap]
  );

  const handleStartDrag = useCallback(() => {
    if (remainingTime === null && level) {
      startTimer();
    }
  }, [remainingTime, level, startTimer]);

  const handleDrop = useCallback(
    (
      data: unknown,
      type: string,
      layerId: string,
      position: number,
      targetPlacedId?: string
    ) => {
      if (!level || isSubmitted || isFailed) return;

      handleStartDrag();

      if (type === 'product') {
        const { productId } = data as { productId: string };
        handleHistoryPush('add', `添加商品 ${productId}`);
        addPlacedProduct({
          productId,
          shelfLayerId: layerId,
        });
      } else if (type === 'placed_product') {
        const { placedId } = data as { placedId: string };

        if (targetPlacedId) {
          handleHistoryPush('swap', `交换商品位置`);
          swapProducts(placedId, targetPlacedId);
        } else {
          const sourceProduct = placedProducts.find((p) => p.id === placedId);
          if (sourceProduct && sourceProduct.shelfLayerId === layerId) {
            handleHistoryPush('move', `移动商品位置`);
            movePlacedProduct(placedId, layerId, position);
          } else {
            handleHistoryPush('move', `跨层移动商品`);
            movePlacedProduct(placedId, layerId, position);
          }
        }
      }
    },
    [
      level,
      isSubmitted,
      isFailed,
      placedProducts,
      handleStartDrag,
      handleHistoryPush,
      addPlacedProduct,
      swapProducts,
      movePlacedProduct,
    ]
  );

  const handleRemove = useCallback(
    (placedId: string) => {
      if (isSubmitted || isFailed) return;
      handleHistoryPush('remove', '移除商品');
      removePlacedProduct(placedId);
    },
    [isSubmitted, isFailed, handleHistoryPush, removePlacedProduct]
  );

  const handleUseItem = useCallback(
    (itemId: string, targetLayerId?: string, targetProductId?: string) => {
      if (isSubmitted || isFailed) return false;

      const success = useItem(itemId);
      if (!success) return false;

      handleHistoryPush('use_item', `使用道具 ${itemId}`);
      applyItemEffect(itemId, targetLayerId, targetProductId);

      return true;
    },
    [
      isSubmitted,
      isFailed,
      useItem,
      handleHistoryPush,
      applyItemEffect,
    ]
  );

  const handleSubmit = () => {
    if (!level) return;

    validateRealTime(level);
    const currentResult = useGameStore.getState().validationResult;
    if (currentResult) {
      submitLevel(level, items);

      if (currentResult.passed) {
        completeLevel(level.id);
        if (level.rewardItemId) {
          const { addItem } = useItemStore.getState();
          addItem(level.rewardItemId, 1);
        }
      }
    }
  };

  const handleReset = () => {
    resetLevel();
    resetItems();
    clearGameState();
  };

  const handleBack = () => {
    pauseTimer();
    persistCurrentState(items);
    navigate('/');
  };

  const handleNextLevel = () => {
    if (!levelId) return;
    const nextId = getNextLevelId(levelId);
    if (nextId) {
      navigate(`/game/${nextId}`);
    } else {
      navigate('/');
    }
  };

  const timeWarning = useMemo(() => {
    if (remainingTime === null) return false;
    return remainingTime <= 30;
  }, [remainingTime]);

  const timeCritical = useMemo(() => {
    if (remainingTime === null) return false;
    return remainingTime <= 10;
  }, [remainingTime]);

  if (!level) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-700">关卡不存在</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const hasProducts = placedProducts.length > 0;
  const nextLevelId = levelId ? getNextLevelId(levelId) : undefined;
  const isDisabled = isSubmitted || isFailed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">返回</span>
            </button>

            <div className="text-center">
              <h1 className="text-lg font-bold text-amber-900">{level.name}</h1>
              <p className="text-xs text-amber-600">{level.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg transition-all
                  ${timeCritical
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : timeWarning
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-green-100 text-green-600'
                  }
                `}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {remainingTime !== null
                    ? formatTime(remainingTime)
                    : formatTime(level.timeLimit)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {level.rules.weightCheck && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                    <Scale className="w-3 h-3" />
                    <span>承重</span>
                  </div>
                )}
                {level.rules.positionCheck && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    <Flame className="w-3 h-3" />
                    <span>位置</span>
                  </div>
                )}
                {level.rules.stockCheck && (
                  <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    <Package className="w-3 h-3" />
                    <span>库存</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <UndoRedoBar />

            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span>修正次数: {correctionCount}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-36">
              <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span>🛒</span>
                <span>商品素材</span>
              </h3>
              <p className="text-xs text-amber-600 mb-4">
                拖拽商品到货架上进行陈列
              </p>

              <div className="grid grid-cols-3 gap-2">
                {level.products.map((product) => {
                  const count = getProductCount(placedProducts, product.id);
                  const effectiveMax = getEffectiveMaxStock(product);
                  const isOverStock = count >= effectiveMax;

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col items-center"
                    >
                      <ProductCard
                        product={product}
                        count={count}
                        size="sm"
                        draggable={!isOverStock && !isDisabled}
                        effectiveMaxStock={effectiveMax}
                        showStockBadge={true}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-amber-100">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">
                  图例说明
                </h4>
                <div className="space-y-1 text-xs text-amber-600">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white">
                      🔥
                    </span>
                    <span>热销商品 - 需放中层视觉位</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-amber-700 rounded-full flex items-center justify-center text-white">
                      📦
                    </span>
                    <span>重物商品 - 需放底层货架</span>
                  </div>
                </div>
              </div>
            </div>

            <ItemPanel
              level={level}
              onUseItem={handleUseItem}
              disabled={isDisabled}
            />
          </div>

          <div className="lg:col-span-5">
            <Shelf
              layers={level.shelfLayers}
              products={level.products}
              disabled={isDisabled}
              onDrop={handleDrop}
              onRemove={handleRemove}
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleReset}
                disabled={isDisabled && !isFailed}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 hover:border-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5" />
                <span>重置</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hasProducts || isDisabled}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white
                  transition-all transform
                  ${hasProducts && !isDisabled
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                <Check className="w-5 h-5" />
                <span>提交校验</span>
              </button>
            </div>

            {isSubmitted && validationResult?.passed && nextLevelId && (
              <button
                onClick={handleNextLevel}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                <span>下一关</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            {scoreResult && isSubmitted && validationResult?.passed ? (
              <ScorePanel result={scoreResult} />
            ) : (
              <ValidationPanel
                result={validationResult}
                isSubmitted={isSubmitted}
                remainingTime={remainingTime}
                isFailed={isFailed}
              />
            )}

            {isSubmitted && !validationResult?.passed && !isFailed && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-semibold text-amber-800 mb-2">
                  💡 调整提示
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  {validationResult?.violations.slice(0, 3).map((v, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{v.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isSubmitted && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">
                  🎯 闯关目标
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {level.rules.weightCheck && (
                    <li className="flex items-start gap-2">
                      <span>⚖️</span>
                      <span>所有货架层承重不超过上限</span>
                    </li>
                  )}
                  {level.rules.positionCheck && (
                    <>
                      <li className="flex items-start gap-2">
                        <span>🔥</span>
                        <span>热销商品放在中层视觉位</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📦</span>
                        <span>重物商品放在底层货架</span>
                      </li>
                    </>
                  )}
                  {level.rules.stockCheck && (
                    <li className="flex items-start gap-2">
                      <span>📦</span>
                      <span>单类商品数量不超过库存上限</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {isFailed && remainingTime === 0 && (
              <button
                onClick={handleReset}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all"
              >
                🔄 重新挑战
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
