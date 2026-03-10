// src/components/Interactive3D.jsx
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Star, ShoppingBag, Gift, Gem } from "lucide-react";

// 3D Tilt Card that follows mouse
export const Tilt3DCard = ({ children, className = "", intensity = 15 }) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 15 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), springConfig);
  const scale = useSpring(isHovered ? 1.05 : 1, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {children}
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          background: `linear-gradient(
            ${useTransform(x, [-0.5, 0.5], [0, 180])}deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          )`,
          opacity: isHovered ? 1 : 0,
        }}
      />
    </motion.div>
  );
};

// Floating 3D Object that follows mouse globally
export const Floating3DObject = ({ 
  icon: Icon, 
  color = "from-primary-500 to-accent-500",
  size = 60,
  initialX = 0,
  initialY = 0,
  floatIntensity = 20,
  followIntensity = 0.05,
  delay = 0,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const targetRef = useRef({ x: initialX, y: initialY });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetRef.current = {
        x: initialX + (e.clientX - centerX) * followIntensity,
        y: initialY + (e.clientY - centerY) * followIntensity,
      };
      setRotation({
        x: (e.clientY - centerY) * 0.02,
        y: (e.clientX - centerX) * 0.02,
        z: Math.sin(Date.now() * 0.001) * 5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [initialX, initialY, followIntensity]);

  // Smooth animation loop
  useEffect(() => {
    let animationId;
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.05,
        y: prev.y + (targetRef.current.y - prev.y) * 0.05,
      }));
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y,
      }}
      transition={{ 
        opacity: { delay, duration: 0.5 },
        scale: { delay, type: "spring", stiffness: 200 },
      }}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
      }}
    >
      <motion.div
        className={`w-${size} h-${size} rounded-2xl bg-gradient-to-br ${color} shadow-2xl flex items-center justify-center`}
        style={{ width: size, height: size }}
        animate={{
          y: [0, -floatIntensity, 0],
          rotateZ: [0, 5, -5, 0],
        }}
        transition={{
          y: { duration: 3 + delay, repeat: Infinity, ease: "easeInOut" },
          rotateZ: { duration: 4 + delay, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Icon className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />
      </motion.div>
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} blur-xl opacity-50 -z-10`}
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
};

// Interactive 3D Hero Section - Just floating icons, no central card
export const Interactive3DHero = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-visible">
      {/* Floating 3D Objects */}
      <Floating3DObject 
        icon={Sparkles} 
        color="from-yellow-400 to-orange-500"
        size={70}
        initialX={-200}
        initialY={-100}
        followIntensity={0.08}
        delay={0}
      />
      <Floating3DObject 
        icon={ShoppingBag} 
        color="from-primary-500 to-indigo-600"
        size={80}
        initialX={250}
        initialY={-80}
        followIntensity={0.06}
        delay={0.2}
      />
      <Floating3DObject 
        icon={Gift} 
        color="from-accent-500 to-pink-600"
        size={60}
        initialX={-250}
        initialY={150}
        followIntensity={0.1}
        delay={0.4}
      />
      <Floating3DObject 
        icon={Gem} 
        color="from-cyan-400 to-blue-500"
        size={55}
        initialX={280}
        initialY={120}
        followIntensity={0.07}
        delay={0.6}
      />
      <Floating3DObject 
        icon={Star} 
        color="from-purple-500 to-violet-600"
        size={50}
        initialX={0}
        initialY={-180}
        followIntensity={0.12}
        delay={0.3}
      />
      <Floating3DObject 
        icon={Zap} 
        color="from-green-400 to-emerald-600"
        size={45}
        initialX={-150}
        initialY={80}
        followIntensity={0.09}
        delay={0.5}
      />
    </div>
  );
};

// Scattered floating icons for background decoration
export const ScatteredFloatingIcons = ({ density = "normal" }) => {
  // Different icon configurations based on density
  const iconConfigs = {
    sparse: [
      { icon: Star, color: "from-yellow-400 to-amber-500", size: 40, x: "10%", y: "20%", follow: 0.05 },
      { icon: Gem, color: "from-cyan-400 to-blue-500", size: 35, x: "85%", y: "30%", follow: 0.07 },
      { icon: Sparkles, color: "from-purple-400 to-violet-500", size: 30, x: "15%", y: "70%", follow: 0.06 },
      { icon: Zap, color: "from-green-400 to-emerald-500", size: 32, x: "90%", y: "75%", follow: 0.08 },
    ],
    normal: [
      { icon: Star, color: "from-yellow-400 to-amber-500", size: 45, x: "5%", y: "15%", follow: 0.05 },
      { icon: Gem, color: "from-cyan-400 to-blue-500", size: 40, x: "92%", y: "20%", follow: 0.07 },
      { icon: Sparkles, color: "from-purple-400 to-violet-500", size: 35, x: "8%", y: "60%", follow: 0.06 },
      { icon: Zap, color: "from-green-400 to-emerald-500", size: 38, x: "88%", y: "65%", follow: 0.08 },
      { icon: Gift, color: "from-pink-400 to-rose-500", size: 42, x: "3%", y: "85%", follow: 0.04 },
      { icon: ShoppingBag, color: "from-indigo-400 to-blue-500", size: 36, x: "95%", y: "88%", follow: 0.06 },
    ],
    dense: [
      { icon: Star, color: "from-yellow-400 to-amber-500", size: 45, x: "5%", y: "10%", follow: 0.05 },
      { icon: Gem, color: "from-cyan-400 to-blue-500", size: 40, x: "92%", y: "15%", follow: 0.07 },
      { icon: Sparkles, color: "from-purple-400 to-violet-500", size: 35, x: "8%", y: "45%", follow: 0.06 },
      { icon: Zap, color: "from-green-400 to-emerald-500", size: 38, x: "88%", y: "50%", follow: 0.08 },
      { icon: Gift, color: "from-pink-400 to-rose-500", size: 42, x: "3%", y: "75%", follow: 0.04 },
      { icon: ShoppingBag, color: "from-indigo-400 to-blue-500", size: 36, x: "95%", y: "80%", follow: 0.06 },
      { icon: Star, color: "from-orange-400 to-red-500", size: 30, x: "25%", y: "8%", follow: 0.09 },
      { icon: Gem, color: "from-teal-400 to-cyan-500", size: 32, x: "75%", y: "12%", follow: 0.05 },
      { icon: Sparkles, color: "from-fuchsia-400 to-pink-500", size: 28, x: "20%", y: "92%", follow: 0.07 },
      { icon: Zap, color: "from-lime-400 to-green-500", size: 34, x: "80%", y: "95%", follow: 0.06 },
    ],
  };

  const icons = iconConfigs[density] || iconConfigs.normal;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {icons.map((config, index) => (
        <FloatingIconFixed
          key={`floating-icon-${index}-${config.x}-${config.y}`}
          icon={config.icon}
          color={config.color}
          size={config.size}
          posX={config.x}
          posY={config.y}
          followIntensity={config.follow}
          delay={index * 0.15}
        />
      ))}
    </div>
  );
};

// Split particle component for the burst effect
const SplitParticle = ({ 
  icon: Icon, 
  color, 
  size, 
  angle, 
  distance,
  onComplete 
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ 
        left: "50%", 
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
      initial={{ 
        x: 0, 
        y: 0, 
        scale: 0.8, 
        opacity: 1 
      }}
      animate={{ 
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: [0.8, 1.2, 0],
        opacity: [1, 0.8, 0],
        rotate: [0, angle > Math.PI ? -360 : 360],
      }}
      transition={{ 
        duration: 2,
        ease: "easeOut",
      }}
      onAnimationComplete={onComplete}
    >
      <div
        className={`rounded-lg bg-gradient-to-br ${color} shadow-lg flex items-center justify-center`}
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <Icon className="text-white" style={{ width: size * 0.3, height: size * 0.3 }} />
      </div>
      <div 
        className={`absolute inset-0 rounded-lg bg-gradient-to-br ${color} blur-md opacity-60 -z-10`}
        style={{ width: size * 0.6, height: size * 0.6 }}
      />
    </motion.div>
  );
};

// Fixed position floating icon for scattered placement - with click interaction
const FloatingIconFixed = ({ 
  icon: Icon, 
  color = "from-primary-500 to-accent-500",
  size = 40,
  posX = "50%",
  posY = "50%",
  followIntensity = 0.05,
  delay = 0,
}) => {
  const [isPopped, setIsPopped] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPopped || !isVisible) return;
    
    setIsPopped(true);
    setIsVisible(false);
    
    // Generate 2-3 split particles with random angles
    const numParticles = Math.random() > 0.5 ? 3 : 2;
    const baseAngle = Math.random() * Math.PI * 2;
    const newParticles = [];
    
    for (let i = 0; i < numParticles; i++) {
      const angle = baseAngle + (i * (Math.PI * 2) / numParticles) + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 60;
      newParticles.push({
        id: Date.now() + i,
        angle,
        distance,
      });
    }
    
    setParticles(newParticles);
    
    // Reset after 4 seconds
    setTimeout(() => {
      setIsPopped(false);
      setIsVisible(true);
      setParticles([]);
    }, 4000);
  };

  const handleParticleComplete = (id) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ 
        left: posX, 
        top: posY,
        pointerEvents: 'auto',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        opacity: { delay, duration: 0.5 },
        scale: { delay, type: "spring", stiffness: 200 },
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.85 }}
    >
      {/* Main icon */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key="main-icon"
            className={`rounded-xl bg-gradient-to-br ${color} shadow-xl flex items-center justify-center cursor-pointer`}
            style={{ width: size, height: size, pointerEvents: 'auto' }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 3, -3, 0],
            }}
            exit={{
              scale: [1, 1.5, 0],
              rotate: [0, 180],
              opacity: [1, 1, 0],
            }}
            transition={{
              y: { duration: 3 + delay * 0.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4 + delay * 0.5, repeat: Infinity, ease: "easeInOut" },
              exit: { duration: 0.3, ease: "easeOut" },
            }}
          >
            <Icon className="text-white pointer-events-none" style={{ width: size * 0.5, height: size * 0.5 }} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Glow effect */}
      <motion.div 
        className={`absolute top-0 left-0 rounded-xl bg-gradient-to-br ${color} blur-lg -z-10 pointer-events-none`}
        style={{ width: size, height: size }}
        animate={{ opacity: isVisible ? 0.4 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Pop burst effect */}
      <AnimatePresence>
        {isPopped && (
          <motion.div
            key="burst"
            className="absolute rounded-full pointer-events-none"
            style={{ 
              width: size * 2, 
              height: size * 2,
              left: "50%",
              top: "50%",
              marginLeft: -size,
              marginTop: -size,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${color} blur-xl`} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Split particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <SplitParticle
            key={particle.id}
            icon={Icon}
            color={color}
            size={size}
            angle={particle.angle}
            distance={particle.distance}
            onComplete={() => handleParticleComplete(particle.id)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default { Tilt3DCard, Floating3DObject, Interactive3DHero, ScatteredFloatingIcons };
