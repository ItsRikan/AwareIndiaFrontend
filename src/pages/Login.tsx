import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavBar } from '@/components/NavBar';
import { Spinner } from '@/components/Spinner';
import { ScanLine, Mail, Lock, User, AtSign, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'login');
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

    // Validate
    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await login(loginForm.email, loginForm.password);
    setIsSubmitting(false);

    if (error) {
      setError(error);
    } else {
      navigate('/scan');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    // Validate
    const result = signupSchema.safeParse(signupForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signup(
      signupForm.email,
      signupForm.password,
      signupForm.name
    );
    setIsSubmitting(false);

    if (error) {
      setError(error);
    } else {
      setSuccess('Account created! Please check your email to verify your account.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <ScanLine className="w-7 h-7 text-primary" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold">Welcome to Aware India</h1>
            <p className="text-muted-foreground mt-2">
              {activeTab === 'login'
                ? 'Sign in to scan products and track your health'
                : 'Create an account to get started'}
            </p>
          </div>



          {/* Tabs */}
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Error / Success messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 mb-4"
                >
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <p className="text-sm text-danger">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-safe/10 border border-safe/20 mb-4"
                >
                  <CheckCircle className="w-4 h-4 text-safe flex-shrink-0" />
                  <p className="text-sm text-safe">{success}</p>
                </motion.div>
              )}

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Email</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(f => ({ ...f, email: e.target.value }))}
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p id="login-email-error" className="text-xs text-danger">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                      />
                    </div>
                    {fieldErrors.password && (
                      <p id="login-password-error" className="text-xs text-danger">{fieldErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm(f => ({ ...f, name: e.target.value }))}
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p id="signup-name-error" className="text-xs text-danger">{fieldErrors.name}</p>
                    )}
                  </div>



                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(f => ({ ...f, email: e.target.value }))}
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p id="signup-email-error" className="text-xs text-danger">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        className="pl-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(f => ({ ...f, password: e.target.value }))}
                        disabled={isSubmitting}
                        aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
                      />
                    </div>
                    {fieldErrors.password && (
                      <p id="signup-password-error" className="text-xs text-danger">{fieldErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer note */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
