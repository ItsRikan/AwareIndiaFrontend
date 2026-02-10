import { motion } from 'framer-motion';
import { CompareResult } from '@/types';
import { RadialScore, HealthScoreMeter } from '@/components/HealthScoreBadge';
import { cn } from '@/lib/utils';
import Img from '@/components/Img';
import { Shield, ShieldAlert, Trophy, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/Magnetic';

interface CompareResultCardProps {
    result: CompareResult;
    onCompareAgain?: () => void;
}

export function CompareResultCard({ result, onCompareAgain }: CompareResultCardProps) {
    const product1IsBest = result.best_product === result.description1 || result.health_score1 > result.health_score2;
    const product2IsBest = !product1IsBest;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-6xl mx-auto"
        >
            {/* Recommendation Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-8 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] glass-card-premium border-primary/30 relative"
            >
                <div className="absolute top-0 right-6 md:right-10 -translate-y-1/2">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="bg-primary/20 backdrop-blur-xl p-3 md:p-4 rounded-full border border-primary/30"
                    >
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary shadow-primary shadow-2xl" />
                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 relative z-10 text-center md:text-left">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 shadow-2xl shadow-primary/20">
                        <Trophy className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 font-display text-white">Recommended Choice</h3>
                        <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl">
                            {result.preferred_for_you}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 shadow-lg">
                            <span className="text-sm md:text-base font-bold text-primary">
                                Winner: {result.best_product}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Comparison Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Product 1 */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        'relative rounded-2xl overflow-hidden',
                        product1IsBest && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                >
                    <div className={cn(
                        'relative rounded-2xl border overflow-hidden',
                        result.is_safe1 ? 'glow-safe' : 'glow-danger'
                    )}>
                        <div className="relative bg-card">
                            {/* Product Image */}
                            <div className="relative aspect-video w-full overflow-hidden">
                                <Img
                                    src={result.url1}
                                    alt="Product 1"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                                {/* Safety Badge */}
                                <div className="absolute top-4 right-4">
                                    <div className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md',
                                        result.is_safe1
                                            ? 'bg-safe/20 border border-safe/30 text-safe'
                                            : 'bg-danger/20 border border-danger/30 text-danger'
                                    )}>
                                        {result.is_safe1 ? (
                                            <Shield className="w-4 h-4" />
                                        ) : (
                                            <ShieldAlert className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {result.is_safe1 ? 'Safe' : 'Caution'}
                                        </span>
                                    </div>
                                </div>

                                {/* Best Badge */}
                                {product1IsBest && (
                                    <div className="absolute top-4 left-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-primary/20 border border-primary/30 text-primary">
                                            <Trophy className="w-4 h-4" />
                                            <span className="text-sm font-medium">Best Choice</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
                                    <div className="flex-1 w-full">
                                        <h2 className="text-xl font-bold mb-2">Product 1</h2>
                                        <div className="flex justify-center sm:justify-start">
                                            <HealthScoreMeter score={result.health_score1} size="sm" />
                                        </div>
                                    </div>
                                    <RadialScore score={result.health_score1} size={70} />
                                </div>

                                {/* Description */}
                                <div className={cn(
                                    'p-4 rounded-xl',
                                    result.is_safe1 ? 'bg-safe/5 border border-safe/20' : 'bg-danger/5 border border-danger/20'
                                )}>
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className={cn(
                                            'w-5 h-5 mt-0.5 flex-shrink-0',
                                            result.is_safe1 ? 'text-safe' : 'text-danger'
                                        )} />
                                        <p className="text-sm leading-relaxed">{result.description1}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Product 2 */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                        'relative rounded-2xl overflow-hidden',
                        product2IsBest && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                >
                    <div className={cn(
                        'relative rounded-2xl border overflow-hidden',
                        result.is_safe2 ? 'glow-safe' : 'glow-danger'
                    )}>
                        <div className="relative bg-card">
                            {/* Product Image */}
                            <div className="relative aspect-video w-full overflow-hidden">
                                <Img
                                    src={result.url2}
                                    alt="Product 2"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                                {/* Safety Badge */}
                                <div className="absolute top-4 right-4">
                                    <div className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md',
                                        result.is_safe2
                                            ? 'bg-safe/20 border border-safe/30 text-safe'
                                            : 'bg-danger/20 border border-danger/30 text-danger'
                                    )}>
                                        {result.is_safe2 ? (
                                            <Shield className="w-4 h-4" />
                                        ) : (
                                            <ShieldAlert className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {result.is_safe2 ? 'Safe' : 'Caution'}
                                        </span>
                                    </div>
                                </div>

                                {/* Best Badge */}
                                {product2IsBest && (
                                    <div className="absolute top-4 left-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-primary/20 border border-primary/30 text-primary">
                                            <Trophy className="w-4 h-4" />
                                            <span className="text-sm font-medium">Best Choice</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
                                    <div className="flex-1 w-full">
                                        <h2 className="text-xl font-bold mb-2">Product 2</h2>
                                        <div className="flex justify-center sm:justify-start">
                                            <HealthScoreMeter score={result.health_score2} size="sm" />
                                        </div>
                                    </div>
                                    <RadialScore score={result.health_score2} size={70} />
                                </div>

                                {/* Description */}
                                <div className={cn(
                                    'p-4 rounded-xl',
                                    result.is_safe2 ? 'bg-safe/5 border border-safe/20' : 'bg-danger/5 border border-danger/20'
                                )}>
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className={cn(
                                            'w-5 h-5 mt-0.5 flex-shrink-0',
                                            result.is_safe2 ? 'text-safe' : 'text-danger'
                                        )} />
                                        <p className="text-sm leading-relaxed">{result.description2}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex justify-center"
            >
                <Magnetic>
                    <Button
                        onClick={onCompareAgain}
                        size="lg"
                        className="h-14 px-8 rounded-xl font-display text-lg gap-2"
                    >
                        Compare Again
                    </Button>
                </Magnetic>
            </motion.div>
        </motion.div>
    );
}
