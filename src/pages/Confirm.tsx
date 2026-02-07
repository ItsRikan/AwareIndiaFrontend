import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { NavBar } from "@/components/NavBar";
import { Spinner } from "@/components/Spinner";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const confirmEmail = async () => {
      // Get token from URL params
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMessage('No confirmation token provided');
        return;
      }

      // Call confirm endpoint
      const result = await apiClient.confirm(token);

      if (result.success) {
        setStatus('success');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Failed to confirm email');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          {status === 'confirming' && (
            <>
              <Spinner size="lg" className="mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Confirming your email…</h1>
              <p className="text-muted-foreground">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <CheckCircle className="w-16 h-16 text-safe" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2 text-safe">Email Confirmed!</h1>
              <p className="text-muted-foreground mb-6">
                Your email has been successfully verified. Redirecting to login…
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <AlertCircle className="w-16 h-16 text-danger" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2 text-danger">Confirmation Failed</h1>
              <p className="text-muted-foreground mb-4">{errorMessage}</p>
              <p className="text-sm text-muted-foreground mb-6">
                Please try requesting a new confirmation link or contact support.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Back to Login
              </Button>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
