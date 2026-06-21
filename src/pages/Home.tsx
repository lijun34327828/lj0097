import { useNavigate } from 'react-router-dom';
import { useLevelStore } from '@/store/useLevelStore';
import { useItemStore } from '@/store/useItemStore';
import LevelCard from '@/components/LevelCard';
import ItemCard from '@/components/ItemCard';
import { ShoppingBasket, Trophy, Sparkles } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { levels, completeLevel } = useLevelStore();
  const { items } = useItemStore();

  const completedCount = levels.filter((l) => l.completed).length;
  const totalCount = levels.length;
  const progress = (completedCount / totalCount) * 100;

  const handleLevelClick = (levelId: string) => {
    const level = useLevelStore.getState().getLevel(levelId);
    if (level?.unlocked) {
      navigate(`/game/${levelId}`);
    }
  };

  const availableItems = items.filter((i) => i.remaining > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-8 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBasket className="w-10 h-10" />
                <h1 className="text-3xl font-bold">货架陈列实训系统</h1>
              </div>
              <p className="text-orange-100 text-sm">
                掌握商品陈列规则，提升零售陈列技能
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-200" />
                <span className="text-sm text-orange-100">学习进度</span>
              </div>
              <div className="w-48 h-3 bg-orange-400/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-orange-100 mt-1">
                {completedCount} / {totalCount} 关
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-amber-900">关卡挑战</h2>
          </div>
          <p className="text-amber-700 text-sm mb-6">
            三重并行校验：承重限制、位置规则、库存数量。拖拽商品完成陈列，全部通过即可通关！
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                onClick={() => handleLevelClick(level.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎒</span>
            <h2 className="text-xl font-bold text-amber-900">道具背包</h2>
            <span className="text-sm text-amber-600">（通关解锁）</span>
          </div>

          {availableItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white/60 rounded-2xl p-8 text-center">
              <p className="text-amber-600">暂无道具，通关可获得道具奖励</p>
              <p className="text-sm text-amber-500 mt-2">完成关卡解锁稀缺陈列道具</p>
            </div>
          )}
        </section>

        <section className="mt-10 bg-white/60 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-4">📖 陈列规则</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-semibold text-amber-800 mb-1">承重限制</h4>
              <p className="text-sm text-amber-600">
                重物商品（📦标识）必须放在底层货架，每层货架有最大承重上限
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="text-2xl mb-2">👁</div>
              <h4 className="font-semibold text-amber-800 mb-1">位置规则</h4>
              <p className="text-sm text-amber-600">
                热销商品（🔥标识）必须放在中层视觉黄金位，提升销售转化率
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="text-2xl mb-2">📦</div>
              <h4 className="font-semibold text-amber-800 mb-1">库存数量</h4>
              <p className="text-sm text-amber-600">
                单类商品摆放数量不能超过库存上限，合理规划陈列空间
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-amber-600 text-sm">
        <p>货架陈列实训系统 · 三重并行校验</p>
      </footer>
    </div>
  );
}
