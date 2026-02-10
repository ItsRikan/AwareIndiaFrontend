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
import { Magnetic } from '@/components/Magnetic';
import { InteractiveBackground } from '@/components/InteractiveBackground';

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

// Spotlight Card Component (High Performance)
function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!divRef.current) return;
    const { left, top } = divRef.current.getBoundingClientRect();
    divRef.current.style.setProperty("--mouse-x", `${e.clientX - left}px`);
    divRef.current.style.setProperty("--mouse-y", `${e.clientY - top}px`);
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`group relative border border-white/[0.03] bg-card/30 backdrop-blur-xl overflow-hidden rounded-[2rem] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(34, 197, 94, 0.08), transparent 80%)`,
        }}
      />
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
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background relative" ref={targetRef}>
      <InteractiveBackground />
      <NavBar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Deep background glow instead of lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/20 rounded-[100%] blur-[150px] pointer-events-none opacity-40" />

        {/* Floating Health & Product Cards (Autonomous Motion) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 select-none">
          {[
            { img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=400", top: "15%", left: "8%", scale: 1.1, label: "Whey Protein", labelColor: "text-primary", duration: 7 },
            { img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400", top: "25%", right: "8%", scale: 0.9, label: "Pet Food", labelColor: "text-accent", duration: 9 },
            { img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400", top: "60%", left: "12%", scale: 1.0, label: "Skincare", labelColor: "text-safe", duration: 8 },
            { img: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=400", top: "70%", right: "12%", scale: 0.95, label: "Healthy Seeds", labelColor: "text-primary", duration: 10 },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              className="absolute"
              style={{
                top: card.top,
                left: card.left || 'auto',
                right: card.right || 'auto',
                zIndex: 0,
                willChange: "transform"
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 0.6,
                scale: card.scale,
                y: [0, -30, 0],
                x: [0, 20, 0],
                rotate: idx % 2 === 0 ? [3, -3, 3] : [-3, 3, -3]
              }}
              transition={{
                opacity: { duration: 1.5, delay: idx * 0.3 },
                scale: { duration: 1.5, delay: idx * 0.3 },
                y: { duration: card.duration, repeat: Infinity, ease: "easeInOut" },
                x: { duration: card.duration + 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: card.duration + 1, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="w-32 sm:w-40 md:w-52 h-44 sm:h-52 md:h-64 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden glass-card-premium border-white/[0.08] shadow-2xl backdrop-blur-md">
                <img src={card.img} alt={card.label} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 flex justify-between items-center">
                  <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 ${card.labelColor}`}>
                    {card.label}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            style={{ y: heroY, opacity }}
            className="text-center max-w-5xl mx-auto perspective-1000"
          >
            {/* REMOVED: Sparkles Badge */}

            <h1 className="text-4xl md:text-7xl lg:text-9xl font-bold mb-6 md:mb-8 leading-[1] md:leading-[0.9] tracking-tighter">
              Know what <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40">you eat</span>{' '}
              <span className="relative inline-block mt-2 md:mt-0">
                <span className="gradient-text relative z-10">fast.</span>
                <motion.div
                  className="absolute -bottom-1 md:-bottom-4 left-0 w-full h-3 md:h-8 bg-primary/20 -skew-x-12 -z-0 blur-lg md:blur-xl"
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
              className="text-lg md:text-2xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 md:px-0"
            >
              Scan packages instantly. Detect hidden additives. <br className="hidden sm:block" />
              Get personalized health insights in your pocket.
            </motion.p>


            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Magnetic strength={0.2}>
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="h-16 px-10 text-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(34,197,94,0.4)] hover:shadow-[0_20px_60px_-15px_rgba(34,197,94,0.6)] hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-primary/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  Start Scanning
                  <ScanLine className="w-6 h-6 ml-3" />
                </Button>
              </Magnetic>

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
                <SpotlightCard className="h-full p-8 transition-all duration-500 hover:scale-[1.02] border border-white/10 active:scale-[0.98]">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg ${feature.bg} ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-display">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl">

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
            {/* Connecting Line REMOVED */}

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
