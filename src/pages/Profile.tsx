import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import {
  User,
  Calendar,
  ShieldCheck,
  Zap,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';

export default function Profile() {
  const { user, isAuthenticated, isLoading, logout, isSupabaseMode } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <main className="flex-1 pt-32 pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8 md:grid-cols-[300px_1fr]"
          >
            {/* Sidebar / Profile Card */}
            <div className="space-y-6">
              <Card className="border-white/10 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 relative">
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay" />
                </div>
                <div className="px-6 pb-6 -mt-12 relative">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                      <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} />
                      <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" title="Online" />
                  </div>

                  <div className="mt-4 space-y-1">
                    <h2 className="text-2xl font-bold truncate">{user.name || 'User'}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      @{user.username || user.email.split('@')[0]}
                      {isSupabaseMode && <Badge variant="secondary" className="h-5 text-[10px] px-1.5">PRO</Badge>}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 h-10 text-danger hover:text-danger hover:bg-danger/10"
                      onClick={() => logout()}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="border-white/10 bg-card/40 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Profile Completion</span>
                  <span className="font-bold text-primary">85%</span>
                </div>
                <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              {/* Account Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-white/10 bg-card/40 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Manage your personal details and account settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 font-medium">
                          {user.name || 'Not set'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 font-medium flex items-center justify-between">
                          {user.email}
                          {isSupabaseMode && <ShieldCheck className="w-4 h-4 text-primary" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-warning" />
                          {isSupabaseMode ? 'Cloud Sync' : 'Local Storage'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
