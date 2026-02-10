import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ingredient } from '@/types';
import { HealthScoreBadge } from '@/components/HealthScoreBadge';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface IngredientCardProps {
  ingredient: Ingredient;
  index?: number;
}

export function IngredientCard({ ingredient, index = 0 }: IngredientCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getTypeClass = (type: string) => {
    const typeMap: Record<string, string> = {
      natural: 'ingredient-natural',
      preservative: 'ingredient-preservative',
      artificial_color: 'ingredient-artificial_color',
      sweetener: 'ingredient-sweetener',
      emulsifier: 'ingredient-emulsifier',
    };
    return typeMap[type] || 'bg-muted text-muted-foreground border border-border';
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const shouldTruncate = ingredient.description.length > 100;
  const displayDescription = expanded
    ? ingredient.description
    : ingredient.description.slice(0, 100) + (shouldTruncate ? '...' : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 rounded-2xl glass-card-premium border-white/5',
        'transition-all duration-300 hover:border-primary/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header: Name + Type */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h4 className="font-semibold text-foreground truncate">
              {ingredient.name}
            </h4>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              getTypeClass(ingredient.Itype)
            )}>
              {formatType(ingredient.Itype)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {displayDescription}
          </p>

          {/* Expand button */}
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline focus-ring rounded"
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Score badge */}
        <HealthScoreBadge score={ingredient.health_score} size="sm" />
      </div>
    </motion.div>
  );
}

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  if (!ingredients.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No ingredient information available</p>
      </div>
    );
  }

  // Sort by health score (worst first for attention)
  const sortedIngredients = [...ingredients].sort((a, b) => a.health_score - b.health_score);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4 font-display">Ingredient Analysis</h3>
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="show"
      >
        {sortedIngredients.map((ingredient, index) => (
          <IngredientCard
            key={`${ingredient.name}-${index}`}
            ingredient={ingredient}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}
