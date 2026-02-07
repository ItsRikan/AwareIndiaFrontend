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
import { ScanResult, SCAN_CATEGORIES, ScanCategory, MOCK_SCAN_RESULT } from '@/types';
import { ScanLine, AlertCircle, Info, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type ScanState = 'idle' | 'uploading' | 'scanning' | 'complete' | 'error';

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
    // Clean up previous preview
    if (previewUrl) {
      revokeImagePreview(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(createImagePreview(file));
    setResult(null);
    setError(null);
    setScanState('idle');
  }, [previewUrl]);

  const handleClearFile = useCallback(() => {
    if (previewUrl) {
      revokeImagePreview(previewUrl);
    }
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
      // Step 1: Compress image
      toast.info('Compressing image...');
      const compressedFile = await compressImage(selectedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
      });

      // Step 2: Compute hash (optional, for caching)
      // Step 2: Compute hash (optional, for caching)
      const imageHash = await computeImageHash(compressedFile);

      // Step 3: Upload image (Direct to ImageKit or Mock)
      setUploadProgress(10);
      const imageUrl = await apiClient.uploadImage(
        compressedFile,
        (progress) => setUploadProgress(progress)
      );

      setUploadProgress(100);
      setScanState('scanning');

      // Step 5: Simulate scanning progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      // Step 6: Call scan API
      const scanResult = await apiClient.scan({
        url: imageUrl,
        category,
        allergy: allergyText || "",
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      // Step 7: Show result
      setResult(scanResult);
      setScanState('complete');

      toast.success('Scan complete!');

    } catch (err) {
      console.error('Scan error:', err);
      setScanState('error');

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Session expired. Please login again.');
          // Optionally redirect to login? 
          // navigate('/login');
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
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Analyzing overlay */}
      <AnimatePresence>
        {scanState === 'scanning' && (
          <AnalyzingOverlay progress={scanProgress} />
        )}
      </AnimatePresence>

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <ScanLine className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Product Scanner</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Scan Your Product
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Upload a clear photo of the product label to analyze ingredients and get health insights.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {result && scanState === 'complete' ? (
              <ResultCard
                key="result"
                result={result}
                onScanAgain={handleScanAgain}
              />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card rounded-2xl border border-border/50 p-6 md:p-8"
              >
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20 mb-6"
                  >
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-danger">Scan failed</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-danger hover:text-danger"
                        onClick={() => {
                          setError(null);
                          setScanState('idle');
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try again
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <Label className="mb-3 block">Product Image</Label>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      selectedFile={selectedFile}
                      previewUrl={previewUrl}
                      onClear={handleClearFile}
                      disabled={scanState === 'uploading' || scanState === 'scanning'}
                      isUploading={scanState === 'uploading'}
                      uploadProgress={uploadProgress}
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <Label htmlFor="category" className="mb-3 block">
                      Product Category
                    </Label>
                    <Select
                      value={category}
                      onValueChange={(value) => setCategory(value as ScanCategory)}
                      disabled={scanState !== 'idle'}
                    >
                      <SelectTrigger id="category" className="w-full">
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

                  {/* Allergy/Disease Input */}
                  <div>
                    <Label htmlFor="allergies" className="mb-3 block">
                      Allergies & Health Conditions
                      <span className="text-muted-foreground font-normal ml-2">(optional)</span>
                    </Label>
                    <Textarea
                      id="allergies"
                      placeholder="E.g., lactose intolerant, allergic to shellfish, diabetic..."
                      value={allergyText}
                      onChange={(e) => setAllergyText(e.target.value)}
                      disabled={scanState !== 'idle'}
                      className="min-h-[100px] resize-none"
                      aria-describedby="allergies-hint"
                    />
                    <p id="allergies-hint" className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      Enter any allergies, intolerances, or health conditions for personalized analysis.
                    </p>
                  </div>

                  {/* Scan Button */}
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleScan}
                    disabled={!canScan}
                  >
                    {scanState === 'uploading' ? (
                      <>Uploading... {Math.round(uploadProgress)}%</>
                    ) : scanState === 'scanning' ? (
                      <>Analyzing ingredients...</>
                    ) : (
                      <>
                        <ScanLine className="w-5 h-5" />
                        Scan Product
                      </>
                    )}
                  </Button>
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
