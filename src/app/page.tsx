import { ProfitCalculator } from '@/components/profit-calculator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-12 lg:p-24 bg-secondary/50">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-primary">
          Real Profit Analyzer
        </h1>
        <ProfitCalculator />
      </div>
    </main>
  );
}
