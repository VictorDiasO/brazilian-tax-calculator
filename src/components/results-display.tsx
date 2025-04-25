"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { CalculatedTax, CalculatedCost } from '@/lib/profit-calculator'; // Import calculated types

// --- Component Props ---
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
  totalCostValuePerUnit: number;
  totalCostValueTotal: number;
  realProfitPerUnit: number;
  realProfitTotal: number;
  profitMarginPercentage: number;
}

interface ResultsDisplayProps {
  results: CalculationResults;
}

// --- Helper Functions ---
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// --- Colors for Charts ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']; // Blue, Green, Yellow, Orange, Purple, Teal


// --- Component ---
export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const {
    productName,
    quantity,
    grossValuePerUnit,
    grossTotalValue,
    calculatedTaxes,
    totalTaxValuePerUnit,
    totalTaxValueTotal,
    calculatedCosts,
    totalCostValuePerUnit,
    totalCostValueTotal,
    realProfitPerUnit,
    realProfitTotal,
    profitMarginPercentage,
  } = results;

  // Data for Pie Chart (Composition of Price per Unit)
  const pieChartData = [
    { name: 'Custo Produto (s/ Imp.)', value: grossValuePerUnit - totalTaxValuePerUnit - (totalCostValuePerUnit - totalTaxValuePerUnit)}, // Approximation: Value - Taxes - Variable Costs
    { name: 'Impostos', value: totalTaxValuePerUnit },
    { name: 'Custos (Fixos+Variáveis)', value: totalCostValuePerUnit - totalTaxValuePerUnit }, // Subtract taxes already included
    { name: 'Lucro Real', value: realProfitPerUnit },
  ].filter(item => item.value > 0); // Filter out zero or negative values for clarity


  // Data for Bar Chart (Total Values Breakdown) - simplified
   const barChartData = [
       {
           name: 'Detalhamento Total',
           'Valor Bruto': grossTotalValue,
           'Impostos': totalTaxValueTotal,
           'Custos': totalCostValueTotal - totalTaxValueTotal, // Subtract taxes
           'Lucro Real': realProfitTotal,
       },
   ];


  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-primary/10 border-primary">
         <CardHeader>
           <CardTitle className="text-xl text-primary">Resumo do Cálculo para "{productName}" ({quantity} {quantity > 1 ? 'unidades' : 'unidade'})</CardTitle>
         </CardHeader>
         <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                 <p className="text-sm text-muted-foreground">Lucro Real Total</p>
                 <p className="text-2xl font-bold text-green-700">{formatCurrency(realProfitTotal)}</p>
              </div>
              <div>
                 <p className="text-sm text-muted-foreground">Lucro por Unidade</p>
                 <p className="text-lg font-semibold">{formatCurrency(realProfitPerUnit)}</p>
              </div>
              <div>
                 <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                 <p className="text-lg font-semibold">{formatPercentage(profitMarginPercentage)}</p>
              </div>
               <div>
                 <p className="text-sm text-muted-foreground">Valor Bruto Total</p>
                 <p className="text-lg font-semibold">{formatCurrency(grossTotalValue)}</p>
              </div>
         </CardContent>
      </Card>


      {/* Detailed Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Detalhamento por Unidade</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Valores detalhados por unidade do produto.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Descrição</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Valor Bruto do Produto</TableCell>
                <TableCell className="text-right">{formatCurrency(grossValuePerUnit)}</TableCell>
              </TableRow>
              {/* Taxes Breakdown */}
              <TableRow className="bg-secondary/30">
                <TableCell colSpan={2} className="font-semibold text-muted-foreground">Impostos</TableCell>
              </TableRow>
              {calculatedTaxes.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell className="pl-6">{tax.name} ({formatPercentage(tax.rate)} sobre {tax.baseDisplay})</TableCell>
                  <TableCell className="text-right">{formatCurrency(tax.valuePerUnit)}</TableCell>
                </TableRow>
              ))}
               <TableRow>
                  <TableCell className="font-medium pl-6">Total Impostos</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(totalTaxValuePerUnit)}</TableCell>
               </TableRow>
              {/* Costs Breakdown */}
              <TableRow className="bg-secondary/30">
                 <TableCell colSpan={2} className="font-semibold text-muted-foreground">Custos</TableCell>
              </TableRow>
              {calculatedCosts.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell className="pl-6">{cost.name} ({cost.type === 'fixed' ? `Fixo rateado` : 'Variável'})</TableCell>
                  <TableCell className="text-right">{formatCurrency(cost.valuePerUnit)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                 <TableCell className="font-medium pl-6">Total Custos (Fixos + Variáveis)</TableCell>
                 <TableCell className="text-right font-semibold">{formatCurrency(totalCostValuePerUnit)}</TableCell>
              </TableRow>
              {/* Final Profit */}
               <TableRow className="bg-green-100 dark:bg-green-900/50">
                 <TableCell className="font-bold text-lg text-green-800 dark:text-green-300">Lucro Real (Líquido)</TableCell>
                 <TableCell className="text-right font-bold text-lg text-green-800 dark:text-green-300">{formatCurrency(realProfitPerUnit)}</TableCell>
               </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts */}
       <Card>
         <CardHeader><CardTitle className="text-lg">Visualização Gráfica (por Unidade)</CardTitle></CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
           {/* Pie Chart */}
           <div className="h-[300px] w-full">
                <p className="text-center font-medium mb-2">Composição do Preço de Venda (Unitário)</p>
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieChartData}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   outerRadius={100}
                   fill="#8884d8"
                   dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                       const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                       const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                       const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                       // Only show label if percentage is significant
                       return percent > 0.05 ? (
                           <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                               {`${(percent * 100).toFixed(0)}%`}
                           </text>
                       ) : null;
                   }}
                 >
                   {pieChartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                 <Legend />
               </PieChart>
             </ResponsiveContainer>
           </div>

           {/* Bar Chart - Simplified to show total breakdown */}
           <div className="h-[300px] w-full">
                <p className="text-center font-medium mb-2">Detalhamento dos Valores Totais</p>
               <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={formatCurrency} />
                        <YAxis type="category" dataKey="name" hide /> {/* Hide Y-axis label as it's implicit */}
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="Valor Bruto" stackId="a" fill={COLORS[0]} name="Valor Bruto" />
                        <Bar dataKey="Impostos" stackId="a" fill={COLORS[1]} name="Impostos" />
                        <Bar dataKey="Custos" stackId="a" fill={COLORS[2]} name="Custos" />
                        <Bar dataKey="Lucro Real" stackId="a" fill={COLORS[3]} name="Lucro Real" />
                    </BarChart>
                </ResponsiveContainer>
           </div>
         </CardContent>
       </Card>
    </div>
  );
}
