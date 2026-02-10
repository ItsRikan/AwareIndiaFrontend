import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { FileUpload } from '@/components/FileUpload';
import { ResultCard } from '@/components/ResultCard';
import { AnalyzingOverlay } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient, computeImageHash, ApiError } from '@/lib/api';
import { compressImage, createImagePreview, revokeImagePreview } from '@/lib/image';
import { ScanResult, SCAN_CATEGORIES, ScanCategory } from '@/types';
import { ScanLine, AlertCircle, Info, Sparkles, Zap, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { Magnetic } from '@/components/Magnetic';
import { InteractiveBackground } from '@/components/InteractiveBackground';

type ScanState = 'idle' | 'uploading' | 'scanning' | 'complete' | 'error';

// Floating Element Component for Background
function FloatingElement({ delay, duration, x, y, children }: { delay: number, duration: number, x: number, y: number, children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 0, y: 0 }}
      animate={{
        x: [0, x, 0],
        y: [0, y, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
      className="absolute pointer-events-none"
    >
      {children}
    </motion.div>
  );
}

export default function Scan() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<ScanCategory>('General');
  const [allergyText, setAllergyText] = useState('');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        revokeImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (previewUrl) revokeImagePreview(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(createImagePreview(file));
    setResult(null);
    setError(null);
    setScanState('idle');
  }, [previewUrl]);

  const handleClearFile = useCallback(() => {
    if (previewUrl) revokeImagePreview(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setScanState('idle');
  }, [previewUrl]);

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setError(null);
    setScanState('uploading');
    setUploadProgress(0);
    setScanProgress(0);

    try {
      toast.info('Compressing image...');
      const compressedFile = await compressImage(selectedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
      });

      // Upload image
      setUploadProgress(10);
      const imageUrl = await apiClient.uploadImage(
        compressedFile,
        (progress) => setUploadProgress(progress)
      );

      setUploadProgress(100);
      setScanState('scanning');

      // Simulate scanning progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      // Call scan API
      const scanResult = await apiClient.scan({
        url: imageUrl,
        category,
        allergy: allergyText || "",
      });

      clearInterval(progressInterval);
      setScanProgress(100);
      setResult(scanResult);
      setScanState('complete');
      toast.success('Scan complete!');

    } catch (err) {
      console.error('Scan error:', err);
      setScanState('error');

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError(err.message);
        }
        toast.error(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
        toast.error('Scan failed. Please try again.');
      }
    }
  };

  const handleScanAgain = () => {
    handleClearFile();
    setAllergyText('');
    setCategory('General');
  };

  const canScan = selectedFile && category && scanState === 'idle';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnalyzingOverlay />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden selection:bg-primary/20">
      <InteractiveBackground />
      <NavBar />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent" />
        <FloatingElement delay={0} duration={8} x={20} y={-20}>
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        </FloatingElement>
        <FloatingElement delay={2} duration={10} x={-20} y={20}>
          <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
        </FloatingElement>

        <FloatingElement delay={1} duration={12} x={-30} y={-10}>
          <Sparkles className="absolute top-40 right-20 w-12 h-12 text-primary/20" />
        </FloatingElement>
        <FloatingElement delay={3} duration={14} x={30} y={10}>
          <Leaf className="absolute bottom-40 left-20 w-16 h-16 text-safe/20 transform -rotate-12" />
        </FloatingElement>
      </div>

      {/* Analyzing overlay */}
      <AnimatePresence>
        {scanState === 'scanning' && (
          <AnalyzingOverlay progress={scanProgress} />
        )}
      </AnimatePresence>

      <main className="flex-1 pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <ScanLine className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">AI-Powered Scanner</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Analyze Your <span className="gradient-text">Product</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Upload a clear photo of the ingredients label. Our AI will detect additives, allergens, and provide a health score instantly.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {result && scanState === 'complete' ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ResultCard
                  result={result}
                  onScanAgain={handleScanAgain}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="grid gap-8 lg:grid-cols-[1fr,350px]"
              >
                {/* Left Column: Image Upload */}
                <div className="glass-card-premium rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                  <div className="space-y-6 relative">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Product Image
                      </Label>
                      {scanState === 'uploading' && (
                        <span className="text-sm text-primary animate-pulse font-medium">Uploading... {Math.round(uploadProgress)}%</span>
                      )}
                    </div>

                    <FileUpload
                      onFileSelect={handleFileSelect}
                      selectedFile={selectedFile}
                      previewUrl={previewUrl}
                      onClear={handleClearFile}
                      disabled={scanState === 'uploading' || scanState === 'scanning'}
                      isUploading={scanState === 'uploading'}
                      uploadProgress={uploadProgress}
                    />

                    {/* Preview Hints */}
                    {!selectedFile && (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 rounded-xl bg-background/50 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-safe" />
                          Clear ingredients text
                        </div>
                        <div className="p-3 rounded-xl bg-background/50 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-safe" />
                          Good lighting
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Options */}
                <div className="space-y-6">
                  {/* Configuration Card */}
                  <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl space-y-6">

                    {/* Category Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-base font-semibold">
                        Category
                      </Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value as ScanCategory)}
                        disabled={scanState !== 'idle'}
                      >
                        <SelectTrigger id="category" className="w-full h-12 bg-background/50 border-white/10 focus:ring-primary/20 rounded-xl">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {SCAN_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Allergies Input */}
                    <div className="space-y-3">
                      <Label htmlFor="allergies" className="text-base font-semibold flex items-center justify-between">
                        Health Profile
                        <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/50">Optional</span>
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="allergies"
                          placeholder="E.g., Vegan, Gluten-free, Peanut allergy..."
                          value={allergyText}
                          onChange={(e) => setAllergyText(e.target.value)}
                          disabled={scanState !== 'idle'}
                          className="min-h-[120px] resize-none bg-background/50 border-white/10 focus:ring-primary/20 rounded-xl p-4 transition-all"
                        />
                        <div className="absolute bottom-3 right-3">
                          <Info className="w-4 h-4 text-muted-foreground/50 hover:text-primary transition-colors cursor-help" />
                        </div>
                      </div>
                    </div>

                    {/* Error State */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20 mb-2">
                            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-danger">{error}</p>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 mt-1 text-danger/80 hover:text-danger"
                                onClick={() => {
                                  setError(null);
                                  setScanState('idle');
                                }}
                              >
                                Try again
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Scan Button */}
                    <Magnetic strength={0.1}>
                      <Button
                        size="lg"
                        className="w-full h-16 text-xl rounded-2xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group"
                        onClick={handleScan}
                        disabled={!canScan}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        {scanState === 'uploading' ? (
                          <>Uploading...</>
                        ) : scanState === 'scanning' ? (
                          <>
                            <Sparkles className="w-6 h-6 mr-3 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <ScanLine className="w-6 h-6 mr-3" />
                            Analyze Product
                          </>
                        )}
                      </Button>
                    </Magnetic>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
