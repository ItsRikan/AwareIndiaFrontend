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
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-card/10 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('/Background.jpg')] bg-cover bg-center opacity-20 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />

        {/* Animated Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingElement delay={0} duration={8} x={30} y={-40}>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          </FloatingElement>
          <FloatingElement delay={2} duration={10} x={-30} y={40}>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[80px]" />
          </FloatingElement>
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-primary/30">
              <ScanLine className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Welcome to the Future of <br /> <span className="gradient-text">Healthy Eating</span></h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join thousands of users making informed decisions about what they consume. AI-powered analysis at your fingertips.
            </p>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { icon: Shield, label: "Detailed Analysis" },
                { icon: Sparkles, label: "AI Powered" },
                { icon: Leaf, label: "Health First" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
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
