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
import { GitCompare, AlertCircle, Info, Sparkles, Scale, ArrowRightLeft, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Magnetic } from '@/components/Magnetic';
import { InteractiveBackground } from '@/components/InteractiveBackground';

type CompareState = 'idle' | 'uploading' | 'comparing' | 'complete' | 'error';

// Floating Element Component
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

export default function Compare() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

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
        setCompareState('idle');
    }, [previewUrl1]);

    const handleFileSelect2 = useCallback((file: File) => {
        if (previewUrl2) revokeImagePreview(previewUrl2);
        setSelectedFile2(file);
        setPreviewUrl2(createImagePreview(file));
        setCompareState('idle');
    }, [previewUrl2]);

    const handleClearFile1 = useCallback(() => {
        if (previewUrl1) revokeImagePreview(previewUrl1);
        setSelectedFile1(null);
        setPreviewUrl1(null);
        setCompareState('idle');
    }, [previewUrl1]);

    const handleClearFile2 = useCallback(() => {
        if (previewUrl2) revokeImagePreview(previewUrl2);
        setSelectedFile2(null);
        setPreviewUrl2(null);
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
            toast.info('Compressing images...');
            const [compressedFile1, compressedFile2] = await Promise.all([
                compressImage(selectedFile1, { maxSizeMB: 1, maxWidthOrHeight: 1920 }),
                compressImage(selectedFile2, { maxSizeMB: 1, maxWidthOrHeight: 1920 })
            ]);

            setCompareState('comparing');

            // Simulate progress
            const interval = setInterval(() => {
                setCompareProgress(prev => Math.min(prev + 5, 90));
            }, 300);

            const compareResult = await apiClient.compare(
                compressedFile1,
                compressedFile2,
                category,
                allergyText,
                useCaseText,
                (progress) => {
                    // Api progress is usually fast for uploads, so we mix it
                    setCompareProgress(p => Math.max(p, progress));
                }
            );

            clearInterval(interval);
            setCompareProgress(100);
            setResult(compareResult);
            setCompareState('complete');
            toast.success('Comparison complete!');

        } catch (err) {
            console.error('Compare error:', err);
            setCompareState('error');
            if (err instanceof ApiError) {
                setError(err.status === 401 ? 'Session expired. Please login again.' : err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleCompareAgain = () => {
        handleClearFile1();
        handleClearFile2();
        setAllergyText('');
        setUseCaseText('');
        setCategory('General');
        setResult(null);
        setCompareState('idle');
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
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden selection:bg-primary/20">
            <InteractiveBackground />
            <NavBar />

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent" />
                <FloatingElement delay={0} duration={8} x={30} y={-30}>
                    <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary/10 rounded-full blur-[90px]" />
                </FloatingElement>
                <FloatingElement delay={2} duration={10} x={-30} y={30}>
                    <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-accent/10 rounded-full blur-[110px]" />
                </FloatingElement>
            </div>

            {/* Analyzing overlay */}
            <AnimatePresence>
                {(compareState === 'uploading' || compareState === 'comparing') && (
                    <AnalyzingOverlay progress={compareProgress} />
                )}
            </AnimatePresence>

            <main className="flex-1 pt-24 pb-12 relative z-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <Scale className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Smart Comparison</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                            Compare & <span className="gradient-text">Choose Better</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
                            Decide between two products instantly. See side-by-side nutritional breakdowns and a clear winner recommendation.
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {result && compareState === 'complete' ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <CompareResultCard
                                    result={result}
                                    onCompareAgain={handleCompareAgain}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                className="grid gap-8 lg:grid-cols-[2fr,1fr]"
                            >
                                {/* Left Column: Dual Upload */}
                                <div className="glass-card-premium rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border-white/10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <ArrowRightLeft className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold font-display">Product Comparison</h2>
                                            <p className="text-sm text-muted-foreground">Upload both products to find the healthier choice</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 relative mt-8">
                                        {/* VS Badge */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex w-14 h-14 rounded-full bg-background border-4 border-card items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                                            <span className="font-black text-primary text-xl italic">VS</span>
                                        </div>

                                        {/* Product 1 */}
                                        <div className="space-y-4">
                                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">Product A</Label>
                                            <FileUpload
                                                onFileSelect={handleFileSelect1}
                                                selectedFile={selectedFile1}
                                                previewUrl={previewUrl1}
                                                onClear={handleClearFile1}
                                                disabled={compareState !== 'idle'}
                                                isUploading={false}
                                                uploadProgress={0}
                                            />
                                        </div>

                                        {/* Product 2 */}
                                        <div className="space-y-4">
                                            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">Product B</Label>
                                            <FileUpload
                                                onFileSelect={handleFileSelect2}
                                                selectedFile={selectedFile2}
                                                previewUrl={previewUrl2}
                                                onClear={handleClearFile2}
                                                disabled={compareState !== 'idle'}
                                                isUploading={false}
                                                uploadProgress={0}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Controls */}
                                <div className="space-y-6">
                                    <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl space-y-5">
                                        <div className="space-y-3">
                                            <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                                            <Select
                                                value={category}
                                                onValueChange={(value) => setCategory(value as ScanCategory)}
                                                disabled={compareState !== 'idle'}
                                            >
                                                <SelectTrigger className="w-full h-12 bg-background/50 border-white/10 focus:ring-primary/20 rounded-xl">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SCAN_CATEGORIES.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Target className="w-4 h-4 text-primary" />
                                                Goal / Health Profile
                                            </Label>
                                            <Textarea
                                                placeholder="E.g. High protein, Vegan, Weight loss..."
                                                value={useCaseText}
                                                onChange={(e) => setUseCaseText(e.target.value)}
                                                className="min-h-[100px] resize-none bg-background/50 border-white/10 focus:ring-primary/20 rounded-xl"
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs"
                                                >
                                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                    {error}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <Magnetic strength={0.1}>
                                            <Button
                                                size="lg"
                                                className="w-full h-16 text-xl rounded-2xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group"
                                                onClick={handleCompare}
                                                disabled={!canCompare}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                {compareState === 'uploading' || compareState === 'comparing' ? (
                                                    <>
                                                        <Sparkles className="w-6 h-6 mr-3 animate-spin" />
                                                        Comparing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Scale className="w-6 h-6 mr-3" />
                                                        Compare Now
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
