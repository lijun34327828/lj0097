import type { ScoreResult } from '@/types';
import { Star, Clock, Wrench, Package } from 'lucide-react';

interface ScorePanelProps {
  result: ScoreResult;
}

export default function ScorePanel({ result }: ScorePanelProps) {
  const { totalScore, stars, breakdown } = result;

  const renderStars = () => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-12 h-12 ${
          i < stars
            ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg'
            : 'text-gray-300'
        } transition-all duration-500`}
        style={{ animationDelay: `${i * 200}ms` }}
      />
    ));
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl shadow-lg p-6 border-2 border-yellow-300">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-amber-900 mb-2">🎊 通关成功！</h3>
        <div className="flex justify-center gap-2 mb-4">{renderStars()}</div>
        <div className="text-4xl font-bold text-amber-600 drop-shadow-sm">
          {totalScore}
          <span className="text-lg text-amber-500 ml-1">分</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/70 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-gray-700">剩余道具</span>
            </div>
            <span className="text-sm text-gray-500">
              {breakdown.remainingItems.remaining} / {breakdown.remainingItems.total}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${(breakdown.remainingItems.score / breakdown.remainingItems.maxScore) * 100}%`,
              }}
            />
          </div>
          <div className="text-right text-sm text-gray-600 mt-1">
            +{breakdown.remainingItems.score} 分
          </div>
        </div>

        <div className="bg-white/70 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-700">修正次数</span>
            </div>
            <span className="text-sm text-gray-500">{breakdown.correctionCount.count} 次</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{
                width: `${(breakdown.correctionCount.score / breakdown.correctionCount.maxScore) * 100}%`,
              }}
            />
          </div>
          <div className="text-right text-sm text-gray-600 mt-1">
            +{breakdown.correctionCount.score} 分
          </div>
        </div>

        <div className="bg-white/70 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-700">时间奖励</span>
            </div>
            <span className="text-sm text-gray-500">
              用时 {Math.floor(breakdown.timeBonus.timeUsed / 60)}分
              {breakdown.timeBonus.timeUsed % 60}秒
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${(breakdown.timeBonus.score / breakdown.timeBonus.maxScore) * 100}%`,
              }}
            />
          </div>
          <div className="text-right text-sm text-gray-600 mt-1">
            +{breakdown.timeBonus.score} 分
          </div>
        </div>
      </div>
    </div>
  );
}
