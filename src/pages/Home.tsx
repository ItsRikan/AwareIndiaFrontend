import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
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
  CheckCircle2
} from 'lucide-react';
import { MouseEvent, useRef } from 'react';

const features = [
  {
    icon: ScanLine,
    title: 'Instant Scanning',
    description: 'Simply snap a photo of any product package and get detailed analysis within seconds.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20'
  },
  {
    icon: Shield,
    title: 'Allergen Detection',
    description: 'Identify potentially harmful additives and allergens personalized to your health profile.',
    color: 'text-safe',
    bg: 'bg-safe/10',
    border: 'border-safe/20'
  },
  {
    icon: Heart,
    title: 'Health Scores',
    description: 'Get easy-to-understand health scores for every ingredient and overall product rating.',
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20'
  },
  {
    icon: Leaf,
    title: 'Smart Categories',
    description: 'Specialized analysis for Food, Cosmetics, Pet Food, and more product categories.',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20'
  },
];

// Spotlight Card Component (Enhanced)
function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(34, 197, 94, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// Floating Element Component for Hero
function FloatingElement({ delay, duration, x, y, rotate, children }: { delay: number, duration: number, x: number, y: number, rotate?: number, children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 0, y: 0, rotate: 0 }}
      animate={{
        x: [0, x, 0],
        y: [0, y, 0],
        rotate: rotate ? [0, rotate, 0] : 0
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

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Mouse tracking for hero effect
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  function onMouseMove({ clientX, clientY }: MouseEvent) {
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/scan');
    } else {
      navigate('/login?tab=signup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background" onMouseMove={onMouseMove} ref={targetRef}>
      <NavBar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Dynamic Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Spotlight Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-[100%] blur-[120px] pointer-events-none opacity-50" />

        {/* Floating 3D Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <FloatingElement delay={0} duration={8} x={40} y={-40} rotate={10}>
            <div className="absolute top-[15%] left-[5%] md:left-[15%] w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl rotate-12">
              <Shield className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            </div>
          </FloatingElement>

          <FloatingElement delay={1} duration={10} x={-30} y={50} rotate={-15}>
            <div className="absolute top-[25%] right-[5%] md:right-[15%] w-20 h-20 rounded-full bg-gradient-to-bl from-accent/20 to-transparent backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl -rotate-6">
              <Zap className="w-8 h-8 text-accent drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            </div>
          </FloatingElement>

          <FloatingElement delay={2} duration={12} x={20} y={40} rotate={5}>
            <div className="absolute bottom-[20%] left-[10%] md:left-[20%] w-28 h-28 rounded-2xl bg-gradient-to-tr from-safe/20 to-transparent backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl rotate-3">
              <Leaf className="w-12 h-12 text-safe drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
          </FloatingElement>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            style={{ y: heroY, opacity, x: useTransform(mouseX, [-0.5, 0.5], [-20, 20]), rotateX: useTransform(mouseY, [-0.5, 0.5], [5, -5]) }}
            className="text-center max-w-5xl mx-auto perspective-1000"
          >
            {/* REMOVED: Sparkles Badge */}

            <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold mb-8 leading-[0.9] tracking-tighter">
              Know what <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">you eat</span>{' '}
              <span className="relative inline-block">
                <span className="gradient-text relative z-10">fast.</span>
                <motion.div
                  className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-4 md:h-8 bg-primary/20 -skew-x-12 -z-0 blur-xl"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Scan packages instantly. Detect hidden additives. <br className="hidden md:block" />
              Get personalized health insights in your pocket.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="h-16 px-10 text-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(34,197,94,0.4)] hover:shadow-[0_20px_60px_-15px_rgba(34,197,94,0.6)] hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-primary/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                Start Scanning
                <ScanLine className="w-6 h-6 ml-3" />
              </Button>

              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-16 px-10 text-xl rounded-2xl border-white/10 hover:bg-white/5 backdrop-blur-sm transition-all duration-300 group"
                >
                  <Link to="/login" className="flex items-center">
                    Login Account
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* REMOVED: Scroll Indicator */}

      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
              Everything you need to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-safe to-accent">stay healthy</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive product analysis powered by advanced AI and extensive ingredient databases.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <SpotlightCard className="h-full p-8 hover:border-primary/30 transition-colors duration-500">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${feature.bg} ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 relative overflow-hidden bg-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to understand any product you pick up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16 max-w-7xl mx-auto relative px-4">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[100px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

            {[
              { step: '01', title: 'Scan or Upload', desc: 'Take a clear photo of ingredients.', icon: ScanLine },
              { step: '02', title: 'AI Analysis', desc: 'Our AI decodes every additive.', icon: Zap },
              { step: '03', title: 'Get Results', desc: 'Instant health score & advice.', icon: CheckCircle2 },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: index * 0.2 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-card border border-white/10 flex items-center justify-center mb-8 shadow-2xl shadow-black/20 group-hover:shadow-primary/20 group-hover:scale-110 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <item.icon className="w-10 h-10 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/50 text-xs font-mono mb-4 text-muted-foreground border border-white/5">
                  STEP {item.step}
                </div>
                <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-[250px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-card to-background p-12 md:p-32 text-center shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 bg-repeat" />
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_50%)] animate-pulse-slow pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">
                Ready to eat <br />
                <span className="gradient-text">smarter?</span>
              </h2>
              <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                Join thousands of health-conscious users who trust Aware India today.
              </p>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="h-20 px-12 text-2xl rounded-full bg-white text-black hover:bg-gray-100 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300"
              >
                Get Started Now
              </Button>
            </div>

            {/* Organic Shapes Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />

          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
