export interface Tax {
  id: string;
  name: string;
  rate: number; // Stored as number (e.g., 18 for 18%)
  base: 'totalValue' | 'valueWithTaxes';
}

export interface Cost {
  id: string;
  name: string;
  value: number; // Stored as number
  type: 'fixed' | 'variable';
}
