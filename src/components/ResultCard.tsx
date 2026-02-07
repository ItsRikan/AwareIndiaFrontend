import { motion } from 'framer-motion';
import { ScanResult } from '@/types';
import { RadialScore, HealthScoreMeter } from '@/components/HealthScoreBadge';
import { IngredientList } from '@/components/IngredientCard';
import { NutritionChips } from '@/components/NutritionChips';
import { cn } from '@/lib/utils';
import Img from '@/components/Img';
import { Shield, ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultCardProps {
  result: ScanResult;
  onScanAgain?: () => void;
}

export function ResultCard({ result, onScanAgain }: ResultCardProps) {
  const isSafe = result.is_safe;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Glow container */}
      <div className={cn(
        'relative rounded-2xl',
        isSafe ? 'glow-safe' : 'glow-danger'
      )}>
        {/* Main card */}
        <div className="relative bg-card rounded-2xl border border-border/50 overflow-hidden">
          {/* Product image */}
          <div className="relative aspect-video w-full overflow-hidden">
            <Img
              src={result.url}
              alt={result.product_name}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            {/* Safety badge overlay */}
            <div className="absolute top-4 right-4">
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full',
                'backdrop-blur-md',
                isSafe 
                  ? 'bg-safe/20 border border-safe/30 text-safe' 
                  : 'bg-danger/20 border border-danger/30 text-danger'
              )}>
                {isSafe ? (
                  <Shield className="w-4 h-4" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isSafe ? 'Safe' : 'Caution'}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Header: Name + Score */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{result.product_name}</h1>
                <HealthScoreMeter score={result.health_score} size="md" />
              </div>
              <RadialScore score={result.health_score} size={100} />
            </div>

            {/* Description / Personalized reason */}
            <div className={cn(
              'p-4 rounded-xl',
              isSafe ? 'bg-safe/5 border border-safe/20' : 'bg-danger/5 border border-danger/20'
            )}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={cn(
                  'w-5 h-5 mt-0.5 flex-shrink-0',
                  isSafe ? 'text-safe' : 'text-danger'
                )} />
                <p className="text-sm leading-relaxed">{result.description}</p>
              </div>
            </div>

            {/* Nutrition */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Nutrition Estimate</h3>
              <NutritionChips nutrition={result.nutrition_estimate} />
            </div>

            {/* Ingredients */}
            <IngredientList ingredients={result.ingredients} />

            {/* Partial data warning */}
            {result.ingredients.length < 3 && (
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning">Limited Data</p>
                    <p className="text-sm text-muted-foreground">
                      Some ingredients could not be extracted — try a clearer photo for better results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
              <Button 
                onClick={onScanAgain}
                className="flex-1"
              >
                Scan Another Product
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                asChild
              >
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  View Image
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
