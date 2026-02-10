import { motion } from 'framer-motion';
import { ScanResult } from '@/types';
import { RadialScore, HealthScoreMeter } from '@/components/HealthScoreBadge';
import { IngredientList } from '@/components/IngredientCard';
import { NutritionChips } from '@/components/NutritionChips';
import { cn } from '@/lib/utils';
import Img from '@/components/Img';
import { Shield, ShieldAlert, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NutritionChart } from '@/components/NutritionChart';
import { Magnetic } from '@/components/Magnetic';

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
        'relative rounded-[2.5rem] p-[2px]',
        isSafe ? 'bg-gradient-to-br from-safe/40 to-transparent' : 'bg-gradient-to-br from-danger/40 to-transparent'
      )}>
        {/* Main card */}
        <div className="relative glass-card-premium rounded-[2.5rem] overflow-hidden">
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
          <div className="p-5 md:p-6 space-y-6">
            {/* Header: Name + Score */}
            <div className="flex flex-col md:flex-row items-start md:justify-between gap-6 md:gap-4">
              <div className="flex-1 w-full text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold mb-3">{result.product_name}</h1>
                <div className="flex justify-center md:justify-start">
                  <HealthScoreMeter score={result.health_score} size="md" />
                </div>
              </div>
              <div className="flex justify-center w-full md:w-auto">
                <RadialScore score={result.health_score} size={window.innerWidth < 768 ? 80 : 100} />
              </div>
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
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-bold mb-4 font-display">Nutritional Analysis</h3>
                <NutritionChips nutrition={result.nutrition_estimate} />
              </div>
              <div className="bg-white/5 rounded-3xl p-4 border border-white/10">
                <NutritionChart nutrition={result.nutrition_estimate} />
              </div>
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
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
              <Magnetic strength={0.2}>
                <Button
                  onClick={onScanAgain}
                  className="w-full h-14 rounded-2xl font-bold text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Scan Another Product
                </Button>
              </Magnetic>
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl border-white/10"
                asChild
              >
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  View Source Image
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
