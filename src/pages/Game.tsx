import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLevelStore } from '@/store/useLevelStore';
import { useGameStore } from '@/store/useGameStore';
import { useItemStore } from '@/store/useItemStore';
import { validateShelf, getProductCount } from '@/utils/validator';
import Shelf from '@/components/Shelf';
import ProductCard from '@/components/ProductCard';
import ValidationPanel from '@/components/ValidationPanel';
import { ArrowLeft, RotateCcw, Check, ChevronRight, Flame, Package, Scale } from 'lucide-react';

export default function Game() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { getLevel, completeLevel, getNextLevelId } = useLevelStore();
  const { placedProducts, validationResult, isSubmitted, setCurrentLevel, setValidationResult, setSubmitted, resetLevel } = useGameStore();
  const { addItem } = useItemStore();

  const level = levelId ? getLevel(levelId) : undefined;

  useEffect(() => {
    if (levelId) {
      setCurrentLevel(levelId);
      resetLevel();
    }
    return () => {
      setCurrentLevel(null);
    };
  }, [levelId, setCurrentLevel, resetLevel]);

  const handleSubmit = () => {
    if (!level) return;

    const result = validateShelf(
      placedProducts,
      level.shelfLayers,
      level.products,
      level.rules
    );

    setValidationResult(result);
    setSubmitted(true);

    if (result.passed) {
      completeLevel(level.id);
      if (level.rewardItemId) {
        addItem(level.rewardItemId, 1);
      }
    }
  };

  const handleReset = () => {
    resetLevel();
  };

  const handleBack = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
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

          <div className="flex items-center gap-2">
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-20">
              <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span>🛒</span>
                <span>商品素材</span>
              </h3>
              <p className="text-xs text-amber-600 mb-4">拖拽商品到货架上进行陈列</p>

              <div className="grid grid-cols-3 gap-2">
                {level.products.map((product) => {
                  const count = getProductCount(placedProducts, product.id);
                  const isOverStock = count >= product.maxStock;

                  return (
                    <div key={product.id} className="flex flex-col items-center">
                      <ProductCard
                        product={product}
                        count={count}
                        size="sm"
                        draggable={!isOverStock}
                      />
                      {isOverStock && (
                        <span className="text-[10px] text-red-500 mt-1">已达上限</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-amber-100">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">图例说明</h4>
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
          </div>

          <div className="lg:col-span-5">
            <Shelf layers={level.shelfLayers} products={level.products} />

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 hover:border-amber-400 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                <span>重置</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hasProducts}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white
                  transition-all transform
                  ${hasProducts
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

          <div className="lg:col-span-4">
            <ValidationPanel result={validationResult} isSubmitted={isSubmitted} />

            {isSubmitted && !validationResult?.passed && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-semibold text-amber-800 mb-2">💡 调整提示</h4>
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
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">🎯 闯关目标</h4>
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
          </div>
        </div>
      </main>
    </div>
  );
}
