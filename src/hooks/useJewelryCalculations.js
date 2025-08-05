import { useMemo } from 'react';

const useJewelryCalculations = (jewelry) => {
  const calculations = useMemo(() => {
    if (!jewelry) return null;

    const materialsCost = jewelry.materials?.reduce((sum, material) => sum + material.totalCost, 0) || 0;
    const totalCost = materialsCost + (jewelry.laborCost || 0) + (jewelry.otherCosts || 0);
    const profit = (jewelry.salePrice || 0) - totalCost;
    const markup = totalCost > 0 ? (profit / totalCost * 100) : 0;

    return {
      materialsCost,
      totalCost,
      profit,
      markup
    };
  }, [jewelry]);

  return calculations;
};

export default useJewelryCalculations;