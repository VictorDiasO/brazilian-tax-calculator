"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { DataInputForm, type FormData } from './data-input-form';
import { ResultsDisplay, type CalculationResults } from './results-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Cost, Tax } from '@/types';
import { calculateProfit } from '@/lib/profit-calculator';

const initialFormData: FormData = {
  productName: '',
  productValue: '',
  quantity: '1',
  taxes: [{ id: 'tax-1', name: 'ICMS', rate: '18', base: 'totalValue' }],
  costs: [
    { id: 'cost-1', name: 'Frete', value: '10', type: 'fixed' },
    { id: 'cost-2', name: 'Embalagem', value: '2', type: 'variable' },
  ],
};

export function ProfitCalculator() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = useCallback((data: FormData) => {
    try {
      const calculatedResults = calculateProfit(data);
      setResults(calculatedResults);
      toast({
        title: 'Cálculo Concluído',
        description: 'Os resultados foram calculados com sucesso.',
      });
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Cálculo',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao calcular o lucro.',
      });
      setResults(null); // Clear previous results on error
    }
  }, [toast]);

  // Memoize the form component to prevent unnecessary re-renders when results change
  const MemoizedDataInputForm = useMemo(() => {
    return (
      <DataInputForm
        initialData={formData}
        onSubmit={handleFormSubmit}
        onClear={() => {
          setFormData(initialFormData);
          setResults(null);
          toast({
            title: 'Formulário Limpo',
            description: 'Todos os campos foram redefinidos.',
          });
        }}
      />
    );
  }, [formData, handleFormSubmit, toast]); // Only re-create if formData changes

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center lg:text-left">Entrada de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          {MemoizedDataInputForm}
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center lg:text-left">Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {results ? (
            <ResultsDisplay results={results} />
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>Preencha o formulário e clique em "Calcular Lucro" para ver os resultados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
