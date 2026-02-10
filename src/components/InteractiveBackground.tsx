import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function InteractiveBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Softer springs for better performance
    const springConfig = { damping: 100, stiffness: 200 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const { scrollY } = useScroll();
    const blob1Y = useTransform(scrollY, [0, 2000], [0, -100]);
    const blob2Y = useTransform(scrollY, [0, 2000], [0, -150]);

    useEffect(() => {
        let frameId: number;
        const handleMouseMove = (e: MouseEvent) => {
            frameId = requestAnimationFrame(() => {
                mouseX.set(e.clientX - 400);
                mouseY.set(e.clientY - 400);
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-background">
            {/* Optimized Blobs - Reduced count and blur for performance */}
            <motion.div
                className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] bg-primary/5 rounded-full blur-[60px]"
                style={{ y: blob1Y, willChange: "transform" }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute bottom-[10%] right-[-5%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[70px]"
                style={{ y: blob2Y, willChange: "transform" }}
                animate={{ scale: [1.05, 1, 1.05] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Single Optimized Interactive Spotlight */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full opacity-20"
                style={{
                    x: springX,
                    y: springY,
                    background: "radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 65%)",
                    willChange: "transform",
                }}
            />

            {/* Static Noise Overlay (Extremely light) */}
            <div className="absolute inset-0 opacity-[0.01] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
        </div>
    );
}
