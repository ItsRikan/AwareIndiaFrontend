import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'spinner rounded-full border-muted border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
  submessage?: string;
}

export function LoadingOverlay({ 
  message = 'Loading...', 
  submessage 
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <Spinner size="lg" />
          <div className="absolute inset-0 animate-ping">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30" />
          </div>
        </div>
        <div>
          <p className="text-lg font-medium animate-pulse">{message}</p>
          {submessage && (
            <p className="text-sm text-muted-foreground mt-1">{submessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface AnalyzingOverlayProps {
  progress?: number;
}

export function AnalyzingOverlay({ progress }: AnalyzingOverlayProps) {
  const messages = [
    'Analyzing ingredients for your health...',
    'Checking for allergens and additives...',
    'Calculating nutritional values...',
    'Generating personalized advice...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
        {/* Animated scanner icon */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 12h4" className="animate-pulse" />
              <path d="M18 12h4" className="animate-pulse animation-delay-150" />
              <rect x="6" y="4" width="12" height="16" rx="2" />
              <line x1="6" y1="12" x2="18" y2="12" className="animate-pulse animation-delay-300" />
            </svg>
          </div>
          {/* Scanning line animation */}
          <div 
            className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{
              animation: 'scanLine 2s ease-in-out infinite',
              top: '50%',
            }}
          />
        </div>

        {/* Progress text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Analyzing Image</h2>
          <p className="text-muted-foreground animate-pulse">
            {messages[Math.floor((progress || 0) / 25) % messages.length]}
          </p>
        </div>

        {/* Progress bar */}
        {typeof progress === 'number' && (
          <div className="w-full max-w-xs">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { transform: translateY(20px); }
        }
      `}</style>
    </div>
  );
}
