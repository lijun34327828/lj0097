import type { Item } from '@/types';

export const items: Item[] = [
  {
    id: 'item1',
    name: '黄金展示位',
    description: '强制某件商品视为正确摆放位置',
    emoji: '🏆',
    effect: 'position_skip',
    remaining: 0,
  },
  {
    id: 'item2',
    name: '承重加固贴',
    description: '临时提升一层货架承重上限50%',
    emoji: '💪',
    effect: 'weight_boost',
    remaining: 0,
  },
  {
    id: 'item3',
    name: '库存扩充卡',
    description: '所有商品库存上限+2',
    emoji: '📦',
    effect: 'stock_boost',
    remaining: 0,
  },
  {
    id: 'item4',
    name: '万能货架层',
    description: '额外增加一层货架空间',
    emoji: '🪜',
    effect: 'extra_layer',
    remaining: 0,
  },
];

export const getItemById = (id: string): Item | undefined => {
  return items.find((i) => i.id === id);
};
