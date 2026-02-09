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
import { History, Calendar, Search, ArrowUpRight, TrendingUp } from 'lucide-react';
import Img from '@/components/Img';
import { Input } from '@/components/ui/input';

export default function HistoryPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchHistory();
        }
    }, [isAuthenticated]);

    const filteredHistory = history.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Stats calculation
    const totalScans = history.length;
    const avgHealthScore = history.length > 0
        ? Math.round(history.reduce((acc, curr) => acc + curr.health_score, 0) / history.length)
        : 0;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <NavBar />

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <main className="flex-1 pt-24 pb-12 px-4 relative z-10">
                <div className="container mx-auto max-w-5xl">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl font-bold mb-2">Scan History</h1>
                            <p className="text-muted-foreground">Track your product analysis journey.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-4"
                        >
                            <div className="px-4 py-2 bg-card border border-white/5 rounded-xl shadow-sm">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Total Scans</span>
                                <span className="text-xl font-bold">{totalScans}</span>
                            </div>
                            <div className="px-4 py-2 bg-card border border-white/5 rounded-xl shadow-sm">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Avg Score</span>
                                <span className={`text-xl font-bold ${avgHealthScore > 70 ? 'text-safe' : avgHealthScore > 40 ? 'text-warning' : 'text-danger'}`}>
                                    {avgHealthScore}
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Search & Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 bg-card/50 border-white/10 rounded-xl focus:ring-primary/20 backdrop-blur-sm"
                            />
                        </div>
                    </motion.div>

                    {filteredHistory.length > 0 ? (
                        <div className="grid gap-4 md:gap-6">
                            {filteredHistory.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-card/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 hover:border-primary/20 hover:bg-card/60 transition-all duration-300 shadow-lg shadow-black/5"
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Image */}
                                        <div className="w-full md:w-32 h-48 md:h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative group-hover:scale-[1.02] transition-transform duration-500">
                                            <Img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold truncate mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(item.created_at)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <HealthScoreBadge score={item.health_score} size="lg" />
                                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Macro Pills */}
                                            <div className="flex flex-wrap gap-2 md:gap-3">
                                                {[
                                                    { label: 'Calories', val: item.calory, unit: '' },
                                                    { label: 'Protein', val: item.protein, unit: 'g' },
                                                    { label: 'Carbs', val: item.sugar, unit: 'g' }, // Assuming sugar as proxy or specific
                                                    { label: 'Fat', val: item.fat, unit: 'g' },
                                                    { label: 'Fiber', val: item.fiber, unit: 'g' },
                                                ].map((stat, i) => (
                                                    <div key={i} className="flex flex-col px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 min-w-[70px]">
                                                        <span className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">{stat.label}</span>
                                                        <span className="text-sm font-semibold">{stat.val}{stat.unit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 px-4 bg-card/30 rounded-3xl border border-white/5 backdrop-blur-sm"
                        >
                            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                                <History className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-3">No scans found</h2>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                {searchQuery ? "No products match your search." : "Start your health journey by scanning your first product."}
                            </p>
                            <Button size="lg" onClick={() => navigate('/scan')} className="rounded-full px-8 h-12">
                                Start Scanning Now
                            </Button>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
