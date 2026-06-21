import type { PlacedProduct, ShelfLayer, Product, ValidationResult } from '@/types';

export const validateShelf = (
  placedProducts: PlacedProduct[],
  shelfLayers: ShelfLayer[],
  products: Product[],
  rules: { weightCheck: boolean; positionCheck: boolean; stockCheck: boolean }
): ValidationResult => {
  const violations: ValidationResult['violations'] = [];

  const productMap = new Map(products.map((p) => [p.id, p]));
  const layerMap = new Map(shelfLayers.map((l) => [l.id, l]));

  const weightDetails: { layerId: string; currentWeight: number; maxWeight: number }[] = [];
  const positionDetails: { productId: string; reason: string }[] = [];
  const stockDetails: { productId: string; currentCount: number; maxStock: number }[] = [];

  let weightPassed = true;
  let positionPassed = true;
  let stockPassed = true;

  if (rules.weightCheck) {
    for (const layer of shelfLayers) {
      const layerProducts = placedProducts.filter((p) => p.shelfLayerId === layer.id);
      const totalWeight = layerProducts.reduce((sum, p) => {
        const product = productMap.get(p.productId);
        return sum + (product?.weight || 0);
      }, 0);

      weightDetails.push({
        layerId: layer.id,
        currentWeight: totalWeight,
        maxWeight: layer.maxWeight,
      });

      if (totalWeight > layer.maxWeight) {
        weightPassed = false;
        violations.push({
          type: 'weight',
          message: `${layer.name} 承重超标`,
          details: `当前承重 ${totalWeight}g / 上限 ${layer.maxWeight}g，超出 ${totalWeight - layer.maxWeight}g`,
        });
      }
    }
  }

  if (rules.positionCheck) {
    const visualLayer = shelfLayers.find((l) => l.isVisual);
    const bottomLayer = shelfLayers.find((l) => l.isBottom);

    for (const placed of placedProducts) {
      const product = productMap.get(placed.productId);
      if (!product) continue;

      const layer = layerMap.get(placed.shelfLayerId);
      if (!layer) continue;

      if (product.isHot && visualLayer && placed.shelfLayerId !== visualLayer.id) {
        const alreadyReported = positionDetails.some((d) => d.productId === product.id && d.reason.includes('视觉位'));
        if (!alreadyReported) {
          positionPassed = false;
          positionDetails.push({ productId: product.id, reason: '热销商品未放在中层视觉位' });
          violations.push({
            type: 'position',
            message: `热销商品「${product.name}」摆放位置错误`,
            details: '热销商品必须放在中层视觉黄金位',
          });
        }
      }

      if (product.isHeavy && bottomLayer && placed.shelfLayerId !== bottomLayer.id) {
        const alreadyReported = positionDetails.some((d) => d.productId === product.id && d.reason.includes('底层'));
        if (!alreadyReported) {
          positionPassed = false;
          positionDetails.push({ productId: product.id, reason: '重物未放在底层货架' });
          violations.push({
            type: 'position',
            message: `重物「${product.name}」摆放位置错误`,
            details: '重物商品仅限放在底层货架',
          });
        }
      }
    }
  }

  if (rules.stockCheck) {
    const productCount = new Map<string, number>();

    for (const placed of placedProducts) {
      const current = productCount.get(placed.productId) || 0;
      productCount.set(placed.productId, current + 1);
    }

    for (const [productId, count] of productCount) {
      const product = productMap.get(productId);
      if (!product) continue;

      stockDetails.push({
        productId,
        currentCount: count,
        maxStock: product.maxStock,
      });

      if (count > product.maxStock) {
        stockPassed = false;
        violations.push({
          type: 'stock',
          message: `「${product.name}」数量超限`,
          details: `当前摆放 ${count} 件 / 库存上限 ${product.maxStock} 件，超出 ${count - product.maxStock} 件`,
        });
      }
    }
  }

  const passed = (rules.weightCheck ? weightPassed : true) &&
    (rules.positionCheck ? positionPassed : true) &&
    (rules.stockCheck ? stockPassed : true);

  return {
    passed,
    violations,
    weightCheck: {
      passed: weightPassed,
      details: weightDetails,
    },
    positionCheck: {
      passed: positionPassed,
      details: positionDetails,
    },
    stockCheck: {
      passed: stockPassed,
      details: stockDetails,
    },
  };
};

export const getLayerProducts = (
  placedProducts: PlacedProduct[],
  layerId: string
): PlacedProduct[] => {
  return placedProducts
    .filter((p) => p.shelfLayerId === layerId)
    .sort((a, b) => a.position - b.position);
};

export const getProductCount = (placedProducts: PlacedProduct[], productId: string): number => {
  return placedProducts.filter((p) => p.productId === productId).length;
};
