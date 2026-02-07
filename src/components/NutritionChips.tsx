import { NutritionEstimate } from '@/types';
import { cn } from '@/lib/utils';
import { Flame, Zap, Beef, Cookie, Droplet, Wheat } from 'lucide-react';

interface NutritionChipsProps {
  nutrition: NutritionEstimate;
  className?: string;
}

interface NutritionItem {
  key: keyof NutritionEstimate;
  label: string;
  unit: string;
  icon: React.ElementType;
  color: string;
}

const nutritionItems: NutritionItem[] = [
  { key: 'calory', label: 'Calories', unit: 'kcal', icon: Flame, color: 'text-orange-400' },
  { key: 'energy', label: 'Energy', unit: 'kJ', icon: Zap, color: 'text-yellow-400' },
  { key: 'protein', label: 'Protein', unit: 'g', icon: Beef, color: 'text-red-400' },
  { key: 'sugar', label: 'Sugar', unit: 'g', icon: Cookie, color: 'text-pink-400' },
  { key: 'fat', label: 'Fat', unit: 'g', icon: Droplet, color: 'text-amber-400' },
  { key: 'fiber', label: 'Fiber', unit: 'g', icon: Wheat, color: 'text-green-400' },
];

export function NutritionChips({ nutrition, className }: NutritionChipsProps) {
  const availableItems = nutritionItems.filter(
    item => nutrition[item.key] !== undefined && nutrition[item.key] !== null
  );

  if (!availableItems.length) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {availableItems.map(item => {
        const value = nutrition[item.key];
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-card-elevated border border-border/50',
              'transition-colors hover:border-border'
            )}
          >
            <Icon className={cn('w-4 h-4', item.color)} />
            <div className="text-sm">
              <span className="font-medium">{value}</span>
              <span className="text-muted-foreground ml-1">{item.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface NutritionTableProps {
  nutrition: NutritionEstimate;
  className?: string;
}

export function NutritionTable({ nutrition, className }: NutritionTableProps) {
  const availableItems = nutritionItems.filter(
    item => nutrition[item.key] !== undefined && nutrition[item.key] !== null
  );

  if (!availableItems.length) {
    return null;
  }

  return (
    <div className={cn('rounded-xl bg-card-elevated border border-border/50 overflow-hidden', className)}>
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="font-semibold">Nutrition Estimate</h3>
        <p className="text-xs text-muted-foreground">Per serving (approximate)</p>
      </div>
      <div className="divide-y divide-border/30">
        {availableItems.map(item => {
          const value = nutrition[item.key];
          const Icon = item.icon;

          return (
            <div 
              key={item.key}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className={cn('w-4 h-4', item.color)} />
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="text-sm font-medium">
                {value} {item.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
