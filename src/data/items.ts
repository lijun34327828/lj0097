import type { Item } from '@/types';

export const items: Item[] = [
  {
    id: 'item1',
    name: '黄金展示位',
    description: '指定一件爆款商品豁免中层视觉位规则',
    emoji: '🏆',
    effect: 'position_skip',
    remaining: 0,
  },
  {
    id: 'item2',
    name: '承重加固贴',
    description: '指定一层货架承重上限临时+2000g',
    emoji: '💪',
    effect: 'weight_boost',
    remaining: 0,
  },
  {
    id: 'item3',
    name: '库存扩充卡',
    description: '指定单品本关数量上限+1',
    emoji: '📦',
    effect: 'stock_boost',
    remaining: 0,
  },
  {
    id: 'item4',
    name: '万能货架层',
    description: '临时新增一层不受任何规则约束的货架',
    emoji: '🪜',
    effect: 'extra_layer',
    remaining: 0,
  },
];

export const getItemById = (id: string): Item | undefined => {
  return items.find((i) => i.id === id);
};
