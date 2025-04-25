"use client";

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Cost, Tax } from '@/types';

// --- Zod Schema Definition ---
const taxSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Nome do imposto é obrigatório." }),
  rate: z.string()
    .min(1, { message: "Alíquota é obrigatória." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Alíquota inválida (use formato 10 ou 10.50)." })
    .transform(val => parseFloat(val)), // Transform to number after validation
  base: z.enum(['totalValue', 'valueWithTaxes'], { message: "Base de cálculo inválida." }),
});

const costSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Nome do custo é obrigatório." }),
  value: z.string()
    .min(1, { message: "Valor é obrigatório." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Valor inválido (use formato 10 ou 10.50)." })
    .transform(val => parseFloat(val)), // Transform to number after validation
  type: z.enum(['fixed', 'variable'], { message: "Tipo de custo inválido." }),
});

const formSchema = z.object({
  productName: z.string().min(1, { message: "Nome do produto é obrigatório." }),
  productValue: z.string()
    .min(1, { message: "Valor do produto é obrigatório." })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Valor inválido (use formato 100 ou 100.50)." })
    .transform(val => parseFloat(val)), // Transform to number after validation
  quantity: z.string()
    .min(1, { message: "Quantidade é obrigatória." })
    .regex(/^\d+$/, { message: "Quantidade deve ser um número inteiro positivo." })
     .refine(val => parseInt(val, 10) > 0, { message: "Quantidade deve ser maior que zero." })
    .transform(val => parseInt(val, 10)), // Transform to integer
  taxes: z.array(taxSchema).min(0, { message: "Adicione pelo menos um imposto ou remova a seção." }),
  costs: z.array(costSchema).min(0, { message: "Adicione pelo menos um custo ou remova a seção." }),
});

// Transform the validated number back to string for the form state consistency if needed,
// or handle numbers directly in the onSubmit. For this example, we keep it as string for input values.
// We will pass the Zod-transformed (numeric) data to the onSubmit handler.
const formSchemaForInput = formSchema.transform(data => ({
    ...data,
    productValue: String(data.productValue),
    quantity: String(data.quantity),
    taxes: data.taxes.map(tax => ({ ...tax, rate: String(tax.rate) })),
    costs: data.costs.map(cost => ({ ...cost, value: String(cost.value) })),
}));

export type FormData = z.infer<typeof formSchemaForInput>;
type FormSubmitData = z.infer<typeof formSchema>; // Use the numeric version for submission

// --- Component Props ---
interface DataInputFormProps {
  initialData: FormData;
  onSubmit: (data: FormSubmitData) => void;
  onClear: () => void;
}

// --- Component ---
export function DataInputForm({ initialData, onSubmit, onClear }: DataInputFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const {
    fields: taxFields,
    append: appendTax,
    remove: removeTax,
  } = useFieldArray({ control, name: 'taxes' });

  const {
    fields: costFields,
    append: appendCost,
    remove: removeCost,
  } = useFieldArray({ control, name: 'costs' });

  const handleFormSubmit = (data: FormData) => {
     // Manually parse string numbers back to actual numbers before submitting
    const numericData: FormSubmitData = {
      ...data,
      productValue: parseFloat(data.productValue),
      quantity: parseInt(data.quantity, 10),
      taxes: data.taxes.map(tax => ({
        ...tax,
        rate: parseFloat(tax.rate),
      })),
      costs: data.costs.map(cost => ({
        ...cost,
        value: parseFloat(cost.value),
      })),
    };
    onSubmit(numericData);
  };

  const handleClearForm = () => {
    reset(initialData); // Reset to initial state provided by parent
    onClear(); // Call the parent's clear handler
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Product Info */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Informações do Produto</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productName">Nome do Produto</Label>
            <Input id="productName" {...register('productName')} aria-invalid={errors.productName ? "true" : "false"} />
            {errors.productName && <p className="text-sm text-destructive mt-1">{errors.productName.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productValue">Valor do Produto (R$)</Label>
              <Input id="productValue" type="text" inputMode='decimal' {...register('productValue')} aria-invalid={errors.productValue ? "true" : "false"} placeholder="Ex: 150.00" />
              {errors.productValue && <p className="text-sm text-destructive mt-1">{errors.productValue.message}</p>}
            </div>
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="text" inputMode='numeric' {...register('quantity')} aria-invalid={errors.quantity ? "true" : "false"} placeholder="Ex: 10" />
              {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Impostos Aplicáveis</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => appendTax({ id: `tax-${Date.now()}`, name: '', rate: '', base: 'totalValue' })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Imposto
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxFields.map((field, index) => (
            <div key={field.id} className="space-y-3 p-4 border rounded-md relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`taxes.${index}.name`}>Nome do Imposto</Label>
                  <Input id={`taxes.${index}.name`} {...register(`taxes.${index}.name`)} placeholder="Ex: ICMS" aria-invalid={errors.taxes?.[index]?.name ? "true" : "false"}/>
                   {errors.taxes?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.taxes?.[index]?.name?.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`taxes.${index}.rate`}>Alíquota (%)</Label>
                  <Input id={`taxes.${index}.rate`} type="text" inputMode='decimal' {...register(`taxes.${index}.rate`)} placeholder="Ex: 18" aria-invalid={errors.taxes?.[index]?.rate ? "true" : "false"} />
                  {errors.taxes?.[index]?.rate && <p className="text-sm text-destructive mt-1">{errors.taxes?.[index]?.rate?.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`taxes.${index}.base`}>Base de Cálculo</Label>
                   <Controller
                      control={control}
                      name={`taxes.${index}.base`}
                      render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <SelectTrigger id={`taxes.${index}.base`} aria-invalid={errors.taxes?.[index]?.base ? "true" : "false"}>
                                  <SelectValue placeholder="Selecione a base" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="totalValue">Sobre Valor Total</SelectItem>
                                  <SelectItem value="valueWithTaxes">Sobre Valor com Outros Impostos</SelectItem>
                              </SelectContent>
                          </Select>
                       )}
                   />
                  {errors.taxes?.[index]?.base && <p className="text-sm text-destructive mt-1">{errors.taxes?.[index]?.base?.message}</p>}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                onClick={() => removeTax(index)}
                aria-label="Remover Imposto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {errors.taxes?.root && <p className="text-sm text-destructive mt-1">{errors.taxes.root.message}</p>}
        </CardContent>
      </Card>

      {/* Costs */}
      <Card>
         <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Custos Fixos e Variáveis</CardTitle>
           <Button type="button" variant="outline" size="sm" onClick={() => appendCost({ id: `cost-${Date.now()}`, name: '', value: '', type: 'fixed' })}>
             <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Custo
           </Button>
         </CardHeader>
        <CardContent className="space-y-4">
          {costFields.map((field, index) => (
            <div key={field.id} className="space-y-3 p-4 border rounded-md relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`costs.${index}.name`}>Nome do Custo</Label>
                  <Input id={`costs.${index}.name`} {...register(`costs.${index}.name`)} placeholder="Ex: Frete" aria-invalid={errors.costs?.[index]?.name ? "true" : "false"}/>
                   {errors.costs?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.costs?.[index]?.name?.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`costs.${index}.value`}>Valor (R$)</Label>
                  <Input id={`costs.${index}.value`} type="text" inputMode='decimal' {...register(`costs.${index}.value`)} placeholder="Ex: 50.00" aria-invalid={errors.costs?.[index]?.value ? "true" : "false"}/>
                  {errors.costs?.[index]?.value && <p className="text-sm text-destructive mt-1">{errors.costs?.[index]?.value?.message}</p>}
                </div>
                <div>
                   <Label htmlFor={`costs.${index}.type`}>Tipo</Label>
                    <Controller
                        control={control}
                        name={`costs.${index}.type`}
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <SelectTrigger id={`costs.${index}.type`} aria-invalid={errors.costs?.[index]?.type ? "true" : "false"}>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed">Fixo</SelectItem>
                                    <SelectItem value="variable">Variável por Unidade</SelectItem>
                                </SelectContent>
                            </Select>
                         )}
                     />
                    {errors.costs?.[index]?.type && <p className="text-sm text-destructive mt-1">{errors.costs?.[index]?.type?.message}</p>}
                </div>
              </div>
               <Button
                 type="button"
                 variant="ghost"
                 size="icon"
                 className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                 onClick={() => removeCost(index)}
                 aria-label="Remover Custo"
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
            </div>
          ))}
           {errors.costs?.root && <p className="text-sm text-destructive mt-1">{errors.costs.root.message}</p>}
        </CardContent>
      </Card>

      <Separator />

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={handleClearForm}>
          Limpar Formulário
        </Button>
        <Button type="submit" style={{ backgroundColor: '#8FBC8F', color: 'white' }} className="hover:bg-green-700">
          Calcular Lucro
        </Button>
      </div>
    </form>
  );
}
