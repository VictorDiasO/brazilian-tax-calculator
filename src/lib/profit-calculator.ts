import type { FormData } from '@/components/data-input-form';
import type { Tax, Cost } from '@/types';

export interface CalculatedTax extends Tax {
  valuePerUnit: number;
  valueTotal: number;
  baseValueUsed: number; // For transparency
  baseDisplay: string; // User-friendly base name
}

export interface CalculatedCost extends Cost {
  valuePerUnit: number;
  valueTotal: number;
}

export interface CalculationResults {
  productName: string;
  quantity: number;
  grossValuePerUnit: number;
  grossTotalValue: number;
  calculatedTaxes: CalculatedTax[];
  totalTaxValuePerUnit: number;
  totalTaxValueTotal: number;
  calculatedCosts: CalculatedCost[];
  totalFixedCosts: number;
  totalVariableCostsPerUnit: number;
  totalVariableCostsTotal: number;
  totalCostValuePerUnit: number; // Includes fixed costs spread across units + variable costs
  totalCostValueTotal: number;
  realProfitPerUnit: number;
  realProfitTotal: number;
  profitMarginPercentage: number;
}

function getBaseDisplay(base: Tax['base']): string {
    switch (base) {
        case 'totalValue': return 'Valor Total';
        case 'valueWithTaxes': return 'Valor c/ Impostos';
        default: return 'Desconhecida';
    }
}


export function calculateProfit(formData: FormData): CalculationResults {
  const { productName, productValue, quantity, taxes, costs } = formData;

  if (quantity <= 0) {
    throw new Error("Quantidade deve ser maior que zero.");
  }

  const grossValuePerUnit = productValue;
  const grossTotalValue = grossValuePerUnit * quantity;

  // --- Calculate Taxes ---
  let totalTaxValuePerUnit = 0;
  let accumulatedValueForTaxBase = grossValuePerUnit; // Start with base product value
  const calculatedTaxes: CalculatedTax[] = [];

  // Sort taxes? Might be needed if calculation order matters (e.g., IPI on top of others)
  // For this example, we calculate sequentially.
  taxes.forEach(tax => {
    let baseValueUsed = 0;
    let taxValuePerUnit = 0;

    if (tax.base === 'totalValue') {
      baseValueUsed = grossValuePerUnit;
    } else if (tax.base === 'valueWithTaxes') {
      // Base is the value *after* adding previously calculated taxes
      // This is a simplification; real tax calculation can be much more complex
      // (e.g., ICMS "por dentro"). Assume simple sequential addition for now.
      baseValueUsed = accumulatedValueForTaxBase;
    } else {
      // Should not happen with validation, but handle defensively
       console.warn(`Base de cálculo desconhecida: ${tax.base}`);
       baseValueUsed = grossValuePerUnit; // Fallback
    }

    taxValuePerUnit = baseValueUsed * (tax.rate / 100);
    totalTaxValuePerUnit += taxValuePerUnit;
    accumulatedValueForTaxBase += taxValuePerUnit; // Update for the next tax calculation if needed

    calculatedTaxes.push({
      ...tax,
      valuePerUnit: taxValuePerUnit,
      valueTotal: taxValuePerUnit * quantity,
      baseValueUsed: baseValueUsed,
      baseDisplay: getBaseDisplay(tax.base),
    });
  });

  const totalTaxValueTotal = totalTaxValuePerUnit * quantity;

  // --- Calculate Costs ---
  let totalFixedCosts = 0;
  let totalVariableCostsPerUnit = 0;
  const calculatedCosts: CalculatedCost[] = [];

  costs.forEach(cost => {
    let costValuePerUnit = 0;
    let costValueTotal = 0;

    if (cost.type === 'fixed') {
      totalFixedCosts += cost.value;
      costValuePerUnit = cost.value / quantity; // Spread fixed cost across units
      costValueTotal = cost.value; // Total fixed cost remains the same regardless of quantity > 0
    } else if (cost.type === 'variable') {
      totalVariableCostsPerUnit += cost.value;
      costValuePerUnit = cost.value; // Variable cost is per unit
      costValueTotal = cost.value * quantity;
    }

    calculatedCosts.push({
      ...cost,
      valuePerUnit: costValuePerUnit,
      valueTotal: costValueTotal,
    });
  });

  const totalVariableCostsTotal = totalVariableCostsPerUnit * quantity;

  // Total Cost Calculation
  const totalCostValuePerUnit = (totalFixedCosts / quantity) + totalVariableCostsPerUnit + totalTaxValuePerUnit;
  const totalCostValueTotal = totalFixedCosts + totalVariableCostsTotal + totalTaxValueTotal;

  // --- Calculate Profit ---
  const realProfitPerUnit = grossValuePerUnit - totalCostValuePerUnit;
  const realProfitTotal = grossTotalValue - totalCostValueTotal;

  // Calculate Profit Margin
  // Avoid division by zero if gross value is zero
  const profitMarginPercentage = grossValuePerUnit > 0
    ? (realProfitPerUnit / grossValuePerUnit) * 100
    : 0;

  return {
    productName,
    quantity,
    grossValuePerUnit,
    grossTotalValue,
    calculatedTaxes,
    totalTaxValuePerUnit,
    totalTaxValueTotal,
    calculatedCosts,
    totalFixedCosts,
    totalVariableCostsPerUnit,
    totalVariableCostsTotal,
    totalCostValuePerUnit,
    totalCostValueTotal,
    realProfitPerUnit,
    realProfitTotal,
    profitMarginPercentage,
  };
}
