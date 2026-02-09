import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, ScanLine, Home, History, GitCompare, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/scan', label: 'Scan', icon: ScanLine, protected: true },
    { href: '/compare', label: 'Compare', icon: GitCompare, protected: true },
    { href: '/history', label: 'History', icon: History, protected: true },
  ];

  const visibleLinks = navLinks.filter(link => !link.protected || isAuthenticated);

  return (
    <motion.header
      className={cn(
        "fixed top-4 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-0",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={cn(
        "container mx-auto px-6 h-16 rounded-full flex items-center justify-between transition-all duration-300",
        scrolled
          ? "bg-black/50 backdrop-blur-xl border border-white/10 shadow-lg max-w-5xl"
          : "bg-transparent max-w-6xl"
      )}>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          aria-label="Aware India Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Aware India
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5 mr-4 backdrop-blur-sm">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  location.pathname === link.href
                    ? "text-primary bg-primary/10 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 rounded-full pl-2 pr-4 bg-white/5 hover:bg-white/10 border border-white/5 gap-2 group transition-all duration-300">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden lg:block max-w-[100px] truncate">{user?.name || "User"}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:rotate-180 transition-transform duration-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
                <DropdownMenuItem asChild className="rounded-xl focus:bg-white/10 cursor-pointer">
                  <Link to="/profile" className="flex items-center gap-2 py-2.5">
                    <User className="w-4 h-4 text-primary" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="text-danger rounded-xl focus:bg-danger/10 focus:text-danger cursor-pointer py-2.5">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                Login
              </Link>
              <Button size="sm" asChild className="h-9 px-5 rounded-full bg-white text-black hover:bg-gray-200 transition-colors font-medium">
                <Link to="/login?tab=signup">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground active:scale-95 transition-transform"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-24 left-4 right-4 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {visibleLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-white/10 my-2 mx-2" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-danger hover:bg-danger/10 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button variant="outline" asChild className="w-full rounded-xl h-12 border-white/10 hover:bg-white/5">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full rounded-xl h-12 bg-white text-black hover:bg-gray-200">
                    <Link to="/login?tab=signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
