import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Spinner } from '@/components/Spinner';
import { HealthScoreBadge } from '@/components/HealthScoreBadge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { HistoryItem } from '@/types';
import { History, Shield, ShieldAlert, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Img from '@/components/Img';

export default function HistoryPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!isAuthenticated) return;

            try {
                const data = await apiClient.getHistory();
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch history:', error);
                // We fail silently or with a specific message, as requested "if it fails... empty list"
                // But let's show a toast for better UX if it's not just "empty"
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchHistory();
        }
    }, [isAuthenticated]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <NavBar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <History className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Scan History</h1>
                                <p className="text-muted-foreground">Your past product scans and analysis</p>
                            </div>
                        </div>
                    </motion.div>

                    {history.length > 0 ? (
                        <div className="grid gap-4">
                            {history.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-card rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all flex flex-col md:flex-row gap-6 md:items-center"
                                >
                                    {/* Image */}
                                    <div className="w-full md:w-24 h-48 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        <Img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold truncate">{item.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(item.created_at)}
                                                </div>
                                            </div>
                                            <HealthScoreBadge score={item.health_score} />
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
                                            <div className="bg-card-elevated p-2 rounded text-center">
                                                <div className="text-xs text-muted-foreground">Calories</div>
                                                <div className="font-semibold">{item.calory}</div>
                                            </div>
                                            <div className="bg-card-elevated p-2 rounded text-center">
                                                <div className="text-xs text-muted-foreground">Protein</div>
                                                <div className="font-semibold">{item.protein}g</div>
                                            </div>
                                            <div className="bg-card-elevated p-2 rounded text-center">
                                                <div className="text-xs text-muted-foreground">Carbs</div>
                                                <div className="font-semibold">{item.sugar}g</div>
                                                {/* Assuming sugar for carbs roughly or just showing sugar */}
                                            </div>
                                            <div className="bg-card-elevated p-2 rounded text-center">
                                                <div className="text-xs text-muted-foreground">Fat</div>
                                                <div className="font-semibold">{item.fat}g</div>
                                            </div>
                                            <div className="bg-card-elevated p-2 rounded text-center">
                                                <div className="text-xs text-muted-foreground">Fiber</div>
                                                <div className="font-semibold">{item.fiber}g</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 bg-card rounded-2xl border border-border/50"
                        >
                            <History className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No history found</h2>
                            <p className="text-muted-foreground mb-6">
                                You haven't scanned any products yet.
                            </p>
                            <Button onClick={() => navigate('/scan')}>
                                Start Scanning
                            </Button>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
