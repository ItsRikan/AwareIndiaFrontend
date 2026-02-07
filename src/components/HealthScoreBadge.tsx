import { cn } from '@/lib/utils';

interface HealthScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function HealthScoreBadge({ 
  score, 
  size = 'md', 
  showLabel = false,
  className 
}: HealthScoreBadgeProps) {
  const getScoreColor = (s: number) => {
    if (s >= 7) return 'score-badge-good';
    if (s >= 4) return 'score-badge-warning';
    return 'score-badge-danger';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 7) return 'Good';
    if (s >= 4) return 'Fair';
    return 'Poor';
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'score-badge',
          getScoreColor(score),
          sizeClasses[size]
        )}
        role="img"
        aria-label={`Health score: ${score} out of 10`}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn(
          'text-sm font-medium',
          score >= 7 ? 'text-safe' : score >= 4 ? 'text-warning' : 'text-danger'
        )}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

interface HealthScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HealthScoreMeter({ score, size = 'md', className }: HealthScoreMeterProps) {
  const percentage = (score / 10) * 100;

  const getGradient = (s: number) => {
    if (s >= 7) return 'from-safe to-safe/70';
    if (s >= 4) return 'from-warning to-warning/70';
    return 'from-danger to-danger/70';
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('bg-muted rounded-full overflow-hidden', heightClasses[size])}>
        <div
          className={cn(
            'h-full bg-gradient-to-r rounded-full transition-all duration-500',
            getGradient(score)
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-label={`Health score: ${score} out of 10`}
        />
      </div>
    </div>
  );
}

interface RadialScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function RadialScore({ 
  score, 
  size = 120, 
  strokeWidth = 8,
  className 
}: RadialScoreProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 10) * circumference;

  const getColor = (s: number) => {
    if (s >= 7) return 'hsl(var(--safe))';
    if (s >= 4) return 'hsl(var(--warning))';
    return 'hsl(var(--danger))';
  };

  const getLabel = (s: number) => {
    if (s >= 7) return 'Good';
    if (s >= 4) return 'Fair';
    return 'Poor';
  };

  return (
    <div 
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Score circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className="text-3xl font-bold"
          style={{ color: getColor(score) }}
        >
          {score}
        </span>
        <span className="text-xs text-muted-foreground">{getLabel(score)}</span>
      </div>
    </div>
  );
}
