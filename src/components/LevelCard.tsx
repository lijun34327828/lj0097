import type { Level } from '@/types';
import { Lock, Star, ChevronRight } from 'lucide-react';

interface LevelCardProps {
  level: Level;
  onClick?: () => void;
}

export default function LevelCard({ level, onClick }: LevelCardProps) {
  const difficultyStars = Array.from({ length: level.difficulty }, (_, i) => i);

  return (
    <button
      onClick={onClick}
      disabled={!level.unlocked}
      className={`
        relative w-full p-5 rounded-2xl text-left
        transition-all duration-300 transform
        ${level.unlocked
          ? 'bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-300 hover:scale-[1.02] hover:shadow-xl hover:border-orange-400 cursor-pointer'
          : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-60'
        }
        ${level.completed ? 'ring-2 ring-green-400 ring-offset-2' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold
            ${level.unlocked ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' : 'bg-gray-300 text-gray-500'}
          `}>
            {level.unlocked ? level.id.replace('level', '') : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h4 className={`font-bold ${level.unlocked ? 'text-amber-900' : 'text-gray-500'}`}>
              {level.name}
            </h4>
            <div className="flex gap-0.5 mt-1">
              {difficultyStars.map((i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${level.unlocked ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {level.completed && (
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ✓ 已通关
          </div>
        )}
      </div>

      <p className={`text-sm ${level.unlocked ? 'text-amber-700' : 'text-gray-400'} mb-3`}>
        {level.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${level.unlocked ? 'bg-orange-200 text-orange-700' : 'bg-gray-200 text-gray-500'}`}>
            {level.products.length} 件商品
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${level.unlocked ? 'bg-amber-200 text-amber-700' : 'bg-gray-200 text-gray-500'}`}>
            {level.shelfLayers.length} 层货架
          </span>
        </div>

        {level.unlocked && (
          <ChevronRight className="w-5 h-5 text-orange-500" />
        )}
      </div>
    </button>
  );
}
