import type { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
  disabled?: boolean;
}

export default function ItemCard({ item, onClick, disabled = false }: ItemCardProps) {
  const hasRemaining = item.remaining > 0;

  return (
    <button
      onClick={onClick}
      disabled={disabled || !hasRemaining}
      className={`
        relative w-full p-4 rounded-xl text-left
        transition-all duration-300 transform
        ${hasRemaining && !disabled
          ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-400 hover:scale-[1.02] hover:shadow-lg cursor-pointer'
          : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center text-2xl
          ${hasRemaining ? 'bg-gradient-to-br from-amber-300 to-yellow-400 shadow-md' : 'bg-gray-300'
        }`}>
          {item.emoji}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${hasRemaining ? 'text-amber-900' : 'text-gray-500'}`}>
            {item.name}
          </h4>
          <p className={`text-xs ${hasRemaining ? 'text-amber-600' : 'text-gray-400'}`}>
            {item.description}
          </p>
        </div>
      </div>

      <div className="absolute -top-2 -right-2">
        <div className={`
          w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
          ${hasRemaining ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' : 'bg-gray-400 text-gray-200'}
          shadow-md
        `}>
          {item.remaining}
        </div>
      </div>
    </button>
  );
}
