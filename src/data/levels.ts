import type { Level } from '@/types';

export const levels: Level[] = [
  {
    id: 'level1',
    name: '新手入门',
    description: '学习基础陈列规则，熟悉拖拽操作',
    difficulty: 1,
    unlocked: true,
    completed: false,
    products: [
      { id: 'p1', name: '薯片大包', emoji: '🍟', weight: 150, isHot: true, isHeavy: false, category: 'snacks', maxStock: 5 },
      { id: 'p3', name: '巧克力棒', emoji: '🍫', weight: 50, isHot: true, isHeavy: false, category: 'snacks', maxStock: 8 },
      { id: 'p4', name: '矿泉水', emoji: '💧', weight: 550, isHot: false, isHeavy: true, category: 'drinks', maxStock: 6 },
    ],
    shelfLayers: [
      { id: 'layer1', level: 0, name: '底层货架', maxWeight: 5000, maxSlots: 6, isVisual: false, isBottom: true },
      { id: 'layer2', level: 1, name: '中层视觉位', maxWeight: 2000, maxSlots: 5, isVisual: true, isBottom: false },
      { id: 'layer3', level: 2, name: '上层货架', maxWeight: 1000, maxSlots: 4, isVisual: false, isBottom: false },
    ],
    rewardItemId: 'item1',
    rules: {
      weightCheck: true,
      positionCheck: true,
      stockCheck: true,
    },
  },
  {
    id: 'level2',
    name: '承重挑战',
    description: '重点训练承重判断，重物必须放底层',
    difficulty: 2,
    unlocked: false,
    completed: false,
    products: [
      { id: 'p2', name: '可乐2L装', emoji: '🥤', weight: 2100, isHot: false, isHeavy: true, category: 'drinks', maxStock: 3 },
      { id: 'p4', name: '矿泉水', emoji: '💧', weight: 550, isHot: false, isHeavy: true, category: 'drinks', maxStock: 6 },
      { id: 'p6', name: '饼干礼盒', emoji: '🍪', weight: 800, isHot: false, isHeavy: true, category: 'snacks', maxStock: 2 },
      { id: 'p8', name: '牛奶1L', emoji: '🥛', weight: 1050, isHot: false, isHeavy: true, category: 'drinks', maxStock: 3 },
      { id: 'p11', name: '大米5kg', emoji: '🍚', weight: 5000, isHot: false, isHeavy: true, category: 'food', maxStock: 1 },
    ],
    shelfLayers: [
      { id: 'layer1', level: 0, name: '底层货架', maxWeight: 8000, maxSlots: 5, isVisual: false, isBottom: true },
      { id: 'layer2', level: 1, name: '中层货架', maxWeight: 3000, maxSlots: 4, isVisual: true, isBottom: false },
      { id: 'layer3', level: 2, name: '上层货架', maxWeight: 1500, maxSlots: 3, isVisual: false, isBottom: false },
    ],
    rewardItemId: 'item2',
    rules: {
      weightCheck: true,
      positionCheck: true,
      stockCheck: true,
    },
  },
  {
    id: 'level3',
    name: '爆款专区',
    description: '热销商品必须放在中层视觉黄金位',
    difficulty: 2,
    unlocked: false,
    completed: false,
    products: [
      { id: 'p1', name: '薯片大包', emoji: '🍟', weight: 150, isHot: true, isHeavy: false, category: 'snacks', maxStock: 5 },
      { id: 'p3', name: '巧克力棒', emoji: '🍫', weight: 50, isHot: true, isHeavy: false, category: 'snacks', maxStock: 8 },
      { id: 'p5', name: '泡面桶装', emoji: '🍜', weight: 120, isHot: true, isHeavy: false, category: 'food', maxStock: 4 },
      { id: 'p7', name: '棒棒糖', emoji: '🍭', weight: 20, isHot: true, isHeavy: false, category: 'candy', maxStock: 10 },
      { id: 'p10', name: '能量饮料', emoji: '⚡', weight: 500, isHot: true, isHeavy: false, category: 'drinks', maxStock: 5 },
      { id: 'p9', name: '坚果混合', emoji: '🥜', weight: 200, isHot: false, isHeavy: false, category: 'snacks', maxStock: 4 },
    ],
    shelfLayers: [
      { id: 'layer1', level: 0, name: '底层货架', maxWeight: 6000, maxSlots: 6, isVisual: false, isBottom: true },
      { id: 'layer2', level: 1, name: '中层视觉位', maxWeight: 2000, maxSlots: 6, isVisual: true, isBottom: false },
      { id: 'layer3', level: 2, name: '上层货架', maxWeight: 1500, maxSlots: 5, isVisual: false, isBottom: false },
    ],
    rewardItemId: 'item3',
    rules: {
      weightCheck: true,
      positionCheck: true,
      stockCheck: true,
    },
  },
  {
    id: 'level4',
    name: '库存管理',
    description: '严格控制单类商品摆放数量',
    difficulty: 2,
    unlocked: false,
    completed: false,
    products: [
      { id: 'p1', name: '薯片大包', emoji: '🍟', weight: 150, isHot: true, isHeavy: false, category: 'snacks', maxStock: 3 },
      { id: 'p3', name: '巧克力棒', emoji: '🍫', weight: 50, isHot: true, isHeavy: false, category: 'snacks', maxStock: 5 },
      { id: 'p7', name: '棒棒糖', emoji: '🍭', weight: 20, isHot: true, isHeavy: false, category: 'candy', maxStock: 6 },
      { id: 'p12', name: '口香糖', emoji: '🫧', weight: 30, isHot: false, isHeavy: false, category: 'candy', maxStock: 8 },
      { id: 'p5', name: '泡面桶装', emoji: '🍜', weight: 120, isHot: true, isHeavy: false, category: 'food', maxStock: 2 },
      { id: 'p4', name: '矿泉水', emoji: '💧', weight: 550, isHot: false, isHeavy: true, category: 'drinks', maxStock: 4 },
    ],
    shelfLayers: [
      { id: 'layer1', level: 0, name: '底层货架', maxWeight: 5000, maxSlots: 8, isVisual: false, isBottom: true },
      { id: 'layer2', level: 1, name: '中层视觉位', maxWeight: 3000, maxSlots: 8, isVisual: true, isBottom: false },
      { id: 'layer3', level: 2, name: '上层货架', maxWeight: 2000, maxSlots: 6, isVisual: false, isBottom: false },
    ],
    rewardItemId: 'item4',
    rules: {
      weightCheck: true,
      positionCheck: true,
      stockCheck: true,
    },
  },
  {
    id: 'level5',
    name: '综合考核',
    description: '三重规则并行考验，检验综合陈列能力',
    difficulty: 3,
    unlocked: false,
    completed: false,
    products: [
      { id: 'p1', name: '薯片大包', emoji: '🍟', weight: 150, isHot: true, isHeavy: false, category: 'snacks', maxStock: 4 },
      { id: 'p2', name: '可乐2L装', emoji: '🥤', weight: 2100, isHot: false, isHeavy: true, category: 'drinks', maxStock: 2 },
      { id: 'p3', name: '巧克力棒', emoji: '🍫', weight: 50, isHot: true, isHeavy: false, category: 'snacks', maxStock: 6 },
      { id: 'p4', name: '矿泉水', emoji: '💧', weight: 550, isHot: false, isHeavy: true, category: 'drinks', maxStock: 5 },
      { id: 'p5', name: '泡面桶装', emoji: '🍜', weight: 120, isHot: true, isHeavy: false, category: 'food', maxStock: 3 },
      { id: 'p7', name: '棒棒糖', emoji: '🍭', weight: 20, isHot: true, isHeavy: false, category: 'candy', maxStock: 8 },
      { id: 'p8', name: '牛奶1L', emoji: '🥛', weight: 1050, isHot: false, isHeavy: true, category: 'drinks', maxStock: 2 },
      { id: 'p10', name: '能量饮料', emoji: '⚡', weight: 500, isHot: true, isHeavy: false, category: 'drinks', maxStock: 4 },
      { id: 'p11', name: '大米5kg', emoji: '🍚', weight: 5000, isHot: false, isHeavy: true, category: 'food', maxStock: 1 },
    ],
    shelfLayers: [
      { id: 'layer1', level: 0, name: '底层货架', maxWeight: 10000, maxSlots: 6, isVisual: false, isBottom: true },
      { id: 'layer2', level: 1, name: '中层视觉位', maxWeight: 3000, maxSlots: 6, isVisual: true, isBottom: false },
      { id: 'layer3', level: 2, name: '上层货架', maxWeight: 1500, maxSlots: 5, isVisual: false, isBottom: false },
    ],
    rewardItemId: 'item1',
    rules: {
      weightCheck: true,
      positionCheck: true,
      stockCheck: true,
    },
  },
];

export const getLevelById = (id: string): Level | undefined => {
  return levels.find((l) => l.id === id);
};
