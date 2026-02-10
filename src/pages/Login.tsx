import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/Spinner';
import {
  ScanLine,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Leaf
} from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Floating Element Component (Reused for consistency)
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
      className="absolute"
    >
      {children}
    </motion.div>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', name: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/scan');
    }
  }, [isAuthenticated, navigate]);

  // Update tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup' || tab === 'login') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await login(loginForm.email, loginForm.password);
    setIsSubmitting(false);

    if (error) setError(error);
    else navigate('/scan');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const result = signupSchema.safeParse(signupForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signup(signupForm.email, signupForm.password, signupForm.name);
    setIsSubmitting(false);

    if (error) setError(error);
    else setSuccess('Account created! Please check your email to verify your account.');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background overscroll-none">

      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-background-deep items-center justify-center p-12 cursor-default">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.08),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.05),transparent_70%)]" />

        {/* Floating Health & Food Cards (Autonomous Motion) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          {[
            { img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400", top: "12%", left: "12%", scale: 1.0, label: "92 / 100", labelColor: "text-safe", duration: 6 },
            { img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400", top: "42%", left: "68%", scale: 0.9, label: "Organic", labelColor: "text-primary", duration: 8 },
            { img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400", top: "68%", left: "18%", scale: 1.05, label: "Non-GMO", labelColor: "text-accent", duration: 7 },
            { img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=400", top: "8%", left: "62%", scale: 0.85, label: "Low Sugar", labelColor: "text-safe", duration: 9 },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              className="absolute"
              style={{
                top: card.top,
                left: card.left,
                zIndex: idx,
                willChange: "transform"
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: card.scale,
                y: [0, -25, 0],
                x: [0, 15, 0],
                rotate: idx % 2 === 0 ? [2, -2, 2] : [-2, 2, -2]
              }}
              transition={{
                opacity: { duration: 1, delay: idx * 0.2 },
                scale: { duration: 1.2, delay: idx * 0.2 },
                y: { duration: card.duration, repeat: Infinity, ease: "easeInOut" },
                x: { duration: card.duration + 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: card.duration + 1, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="w-52 h-64 rounded-[2.5rem] overflow-hidden glass-card-premium border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700">
                <img src={card.img} alt="Health" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 ${card.labelColor}`}>
                    {card.label}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white/40" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Central Brand Messaging */}
        <div className="relative z-10 max-w-lg text-center select-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-[2.5rem] mx-auto mb-10 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.3)] relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <ScanLine className="w-12 h-12 text-white relative z-10 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter leading-[1.05]">
              Elevate Your <br />
              <span className="gradient-text font-black">Food Intelligence</span>
            </h2>
            <p className="text-lg text-muted-foreground/70 leading-relaxed max-w-sm mx-auto font-medium">
              Join the elite circle of conscious consumers using AI to verify every ingredient.
            </p>

            <div className="mt-14 flex justify-center items-center gap-10">
              {[
                { icon: Shield, label: "Secure" },
                { icon: Sparkles, label: "AI" },
                { icon: Leaf, label: "Organic" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-primary/10 hover:border-primary/20 transition-all duration-300">
                    <item.icon className="w-5 h-5 text-primary/40" />
                  </div>
                  <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground/40">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 relative overflow-hidden">
        {/* Mobile Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 lg:hidden" />

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity self-start">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">Aware India</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'login'
                  ? 'Enter your details to access your account'
                  : 'Start your journey to healthier living today'}
              </p>
            </div>

            {/* Custom Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-muted/50 rounded-xl mb-8 relative">
              <motion.div
                className="absolute inset-y-1 bg-background shadow-sm rounded-lg"
                layoutId="activeTab"
                initial={false}
                animate={{
                  left: activeTab === 'login' ? '4px' : '50%',
                  width: 'calc(50% - 4px)'
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
              <button
                onClick={() => setActiveTab('login')}
                className={`relative z-10 py-2.5 text-sm font-medium transition-colors ${activeTab === 'login' ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`relative z-10 py-2.5 text-sm font-medium transition-colors ${activeTab === 'signup' ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Error / Success Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 mb-6 text-danger text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-safe/10 border border-safe/20 mb-6 text-safe text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </motion.div>
              )}

              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="hello@example.com"
                        className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    {fieldErrors.email && <p className="text-xs text-danger">{fieldErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                      <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      />
                    </div>
                    {fieldErrors.password && <p className="text-xs text-danger">{fieldErrors.password}</p>}
                  </div>

                  <Button type="submit" size="lg" className="w-full h-11 text-base group" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size="sm" className="mr-2" /> : (
                      <>
                        Sign In <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignup}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signup-name"
                        placeholder="John Doe"
                        className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    {fieldErrors.name && <p className="text-xs text-danger">{fieldErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="hello@example.com"
                        className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    {fieldErrors.email && <p className="text-xs text-danger">{fieldErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Min 6 characters"
                        className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(f => ({ ...f, password: e.target.value }))}
                      />
                    </div>
                    {fieldErrors.password && <p className="text-xs text-danger">{fieldErrors.password}</p>}
                  </div>

                  <Button type="submit" size="lg" className="w-full h-11 text-base group" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size="sm" className="mr-2" /> : (
                      <>
                        Create Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-muted-foreground mt-8">
              By clicking continue, you agree to our <br />
              <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
