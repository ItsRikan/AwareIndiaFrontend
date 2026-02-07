import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { HealthScoreBadge } from '@/components/HealthScoreBadge';
import { ScanResult } from '@/types';
import {
  User,
  Mail,
  Calendar,
  History,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScanHistoryItem extends ScanResult {
  scannedAt: string;
  category: string;
}

export default function Profile() {
  const { user, isAuthenticated, isLoading, deleteAccount, logout, isSupabaseMode } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const { error } = await deleteAccount();
    setIsDeleting(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Account deleted successfully');
      navigate('/');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border/50 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <History className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auth Mode</p>
                  <p className="font-medium">{isSupabaseMode ? 'Supabase' : 'Local Storage'}</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
