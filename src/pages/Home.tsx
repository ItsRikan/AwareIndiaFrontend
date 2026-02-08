import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { 
  ScanLine, 
  Shield, 
  Zap, 
  Heart, 
  ArrowRight,
  Leaf,
  AlertTriangle,
  BarChart3,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: ScanLine,
    title: 'Instant Scanning',
    description: 'Simply snap a photo of any product package and get detailed analysis within seconds.',
    color: 'text-primary',
  },
  {
    icon: Shield,
    title: 'Allergen Detection',
    description: 'Identify potentially harmful additives and allergens personalized to your health profile.',
    color: 'text-safe',
  },
  {
    icon: Heart,
    title: 'Health Scores',
    description: 'Get easy-to-understand health scores for every ingredient and overall product rating.',
    color: 'text-danger',
  },
  {
    icon: Leaf,
    title: 'Smart Categories',
    description: 'Specialized analysis for Food, Cosmetics, Pet Food, and more product categories.',
    color: 'text-warning',
  },
];

// no hero stats — removed to avoid displaying unverifiable numbers

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/scan');
    } else {
      navigate('/login?tab=signup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* Hero Section */}
      <section className="hero-bg pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Know what you eat{' '}
              <span className="gradient-text">— fast.</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
              Scan packages, detect additives & allergens, get personalized advice 
              for healthier choices. Your health companion in your pocket.
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="gap-2 text-base px-8"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
              {!isAuthenticated && (
                <Button 
                  size="lg" 
                  variant="outline"
                  asChild
                  className="text-base px-8"
                >
                  <Link to="/login">Login</Link>
                </Button>
              )}
            </motion.div>

            {/* Stats removed */}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{' '}
              <span className="gradient-text">stay healthy</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive product analysis powered by advanced AI and extensive ingredient databases.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-card-elevated flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to understand any product you pick up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Scan or Upload',
                description: 'Take a photo of the product label or upload an existing image.',
                icon: ScanLine,
              },
              {
                step: '02',
                title: 'AI Analysis',
                description: 'Our AI analyzes ingredients, additives, and nutritional information.',
                icon: BarChart3,
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Receive detailed health scores and personalized recommendations.',
                icon: AlertTriangle,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="text-6xl font-bold text-primary/10 absolute -top-4 left-1/2 -translate-x-1/2">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20" />
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm" />
            
            <div className="relative p-8 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to make healthier choices?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of health-conscious users who trust Aware India 
                for their daily product decisions.
              </p>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="gap-2 text-base px-8"
              >
                Start Scanning Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
