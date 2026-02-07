import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { FileUpload } from '@/components/FileUpload';
import { CompareResultCard } from '@/components/CompareResultCard';
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
import { apiClient, ApiError } from '@/lib/api';
import { compressImage, createImagePreview, revokeImagePreview } from '@/lib/image';
import { CompareResult, SCAN_CATEGORIES, ScanCategory } from '@/types';
import { GitCompare, AlertCircle, Info, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type CompareState = 'idle' | 'uploading' | 'comparing' | 'complete' | 'error';

export default function Compare() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Product 1 state
    const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
    const [previewUrl1, setPreviewUrl1] = useState<string | null>(null);

    // Product 2 state
    const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
    const [previewUrl2, setPreviewUrl2] = useState<string | null>(null);

    // Form state
    const [category, setCategory] = useState<ScanCategory>('General');
    const [allergyText, setAllergyText] = useState('');
    const [useCaseText, setUseCaseText] = useState('');

    // Comparison state
    const [compareState, setCompareState] = useState<CompareState>('idle');
    const [compareProgress, setCompareProgress] = useState(0);
    const [result, setResult] = useState<CompareResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            if (previewUrl1) revokeImagePreview(previewUrl1);
            if (previewUrl2) revokeImagePreview(previewUrl2);
        };
    }, [previewUrl1, previewUrl2]);

    const handleFileSelect1 = useCallback((file: File) => {
        if (previewUrl1) revokeImagePreview(previewUrl1);
        setSelectedFile1(file);
        setPreviewUrl1(createImagePreview(file));
        setResult(null);
        setError(null);
        setCompareState('idle');
    }, [previewUrl1]);

    const handleFileSelect2 = useCallback((file: File) => {
        if (previewUrl2) revokeImagePreview(previewUrl2);
        setSelectedFile2(file);
        setPreviewUrl2(createImagePreview(file));
        setResult(null);
        setError(null);
        setCompareState('idle');
    }, [previewUrl2]);

    const handleClearFile1 = useCallback(() => {
        if (previewUrl1) revokeImagePreview(previewUrl1);
        setSelectedFile1(null);
        setPreviewUrl1(null);
        setResult(null);
        setError(null);
        setCompareState('idle');
    }, [previewUrl1]);

    const handleClearFile2 = useCallback(() => {
        if (previewUrl2) revokeImagePreview(previewUrl2);
        setSelectedFile2(null);
        setPreviewUrl2(null);
        setResult(null);
        setError(null);
        setCompareState('idle');
    }, [previewUrl2]);

    const handleCompare = async () => {
        if (!selectedFile1 || !selectedFile2) {
            toast.error('Please select both product images');
            return;
        }

        setError(null);
        setCompareState('uploading');
        setCompareProgress(0);

        try {
            // Step 1: Compress images
            toast.info('Compressing images...');
            const [compressedFile1, compressedFile2] = await Promise.all([
                compressImage(selectedFile1, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                }),
                compressImage(selectedFile2, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                })
            ]);

            setCompareState('comparing');

            // Step 2: Upload and compare
            const compareResult = await apiClient.compare(
                compressedFile1,
                compressedFile2,
                category,
                allergyText,
                useCaseText,
                (progress) => setCompareProgress(progress)
            );

            setCompareProgress(100);

            // Step 3: Show result
            setResult(compareResult);
            setCompareState('complete');

            toast.success('Comparison complete!');

        } catch (err) {
            console.error('Compare error:', err);
            setCompareState('error');

            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError('Session expired. Please login again.');
                } else {
                    setError(err.message);
                }
                toast.error(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
                toast.error('Comparison failed. Please try again.');
            }
        }
    };

    const handleCompareAgain = () => {
        handleClearFile1();
        handleClearFile2();
        setAllergyText('');
        setUseCaseText('');
        setCategory('General');
    };

    const canCompare = selectedFile1 && selectedFile2 && category && compareState === 'idle';

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
                {(compareState === 'uploading' || compareState === 'comparing') && (
                    <AnalyzingOverlay progress={compareProgress} />
                )}
            </AnimatePresence>

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                            <GitCompare className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Product Comparison</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Compare Products
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Upload two product images to compare their ingredients, health scores, and get personalized recommendations.
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {result && compareState === 'complete' ? (
                            <CompareResultCard
                                key="result"
                                result={result}
                                onCompareAgain={handleCompareAgain}
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
                                            <p className="text-sm font-medium text-danger">Comparison failed</p>
                                            <p className="text-sm text-muted-foreground">{error}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 text-danger hover:text-danger"
                                                onClick={() => {
                                                    setError(null);
                                                    setCompareState('idle');
                                                }}
                                            >
                                                <RotateCcw className="w-4 h-4 mr-2" />
                                                Try again
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="space-y-6">
                                    {/* Dual File Upload */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Product 1 */}
                                        <div>
                                            <Label className="mb-3 block">Product 1 Image</Label>
                                            <FileUpload
                                                onFileSelect={handleFileSelect1}
                                                selectedFile={selectedFile1}
                                                previewUrl={previewUrl1}
                                                onClear={handleClearFile1}
                                                disabled={compareState === 'uploading' || compareState === 'comparing'}
                                                isUploading={compareState === 'uploading'}
                                                uploadProgress={compareProgress}
                                            />
                                        </div>

                                        {/* Product 2 */}
                                        <div>
                                            <Label className="mb-3 block">Product 2 Image</Label>
                                            <FileUpload
                                                onFileSelect={handleFileSelect2}
                                                selectedFile={selectedFile2}
                                                previewUrl={previewUrl2}
                                                onClear={handleClearFile2}
                                                disabled={compareState === 'uploading' || compareState === 'comparing'}
                                                isUploading={compareState === 'uploading'}
                                                uploadProgress={compareProgress}
                                            />
                                        </div>
                                    </div>

                                    {/* Category Selection */}
                                    <div>
                                        <Label htmlFor="category" className="mb-3 block">
                                            Product Category
                                        </Label>
                                        <Select
                                            value={category}
                                            onValueChange={(value) => setCategory(value as ScanCategory)}
                                            disabled={compareState !== 'idle'}
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
                                            disabled={compareState !== 'idle'}
                                            className="min-h-[80px] resize-none"
                                            aria-describedby="allergies-hint"
                                        />
                                        <p id="allergies-hint" className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            Enter any allergies, intolerances, or health conditions for personalized analysis.
                                        </p>
                                    </div>

                                    {/* Use Case Input */}
                                    <div>
                                        <Label htmlFor="usecase" className="mb-3 block">
                                            Use Case
                                            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
                                        </Label>
                                        <Textarea
                                            id="usecase"
                                            placeholder="E.g., post-workout snack, breakfast option, kids' lunch..."
                                            value={useCaseText}
                                            onChange={(e) => setUseCaseText(e.target.value)}
                                            disabled={compareState !== 'idle'}
                                            className="min-h-[80px] resize-none"
                                            aria-describedby="usecase-hint"
                                        />
                                        <p id="usecase-hint" className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            Describe how you plan to use this product for better recommendations.
                                        </p>
                                    </div>

                                    {/* Compare Button */}
                                    <Button
                                        size="lg"
                                        className="w-full gap-2"
                                        onClick={handleCompare}
                                        disabled={!canCompare}
                                    >
                                        {compareState === 'uploading' ? (
                                            <>Uploading... {Math.round(compareProgress)}%</>
                                        ) : compareState === 'comparing' ? (
                                            <>Comparing products...</>
                                        ) : (
                                            <>
                                                <GitCompare className="w-5 h-5" />
                                                Compare Products
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
