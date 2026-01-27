import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface PremiumBackgroundProps {
  variant?: 'teams' | 'dashboard' | 'projects';
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
}

// 3D Floating Geometric Shapes Component
const FloatingShapes: React.FC<{ variant: string }> = ({ variant }) => {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.getElapsedTime();
    
    group.current.rotation.x = Math.sin(time * 0.1) * 0.2;
    group.current.rotation.y = Math.sin(time * 0.15) * 0.3;
    
    group.current.children.forEach((child, i) => {
      const offset = i * 0.5;
      child.position.y = Math.sin(time * 0.3 + offset) * 1.5;
      child.rotation.x = time * 0.2 + offset;
      child.rotation.z = time * 0.15 + offset;
    });
  });

  const colors = {
    teams: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'],
    dashboard: ['#10b981', '#14b8a6', '#3b82f6', '#6366f1'],
    projects: ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'],
  };

  const shapeColors = colors[variant as keyof typeof colors] || colors.teams;

  return (
    <group ref={group}>
      <mesh position={[-4, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={shapeColors[0]} wireframe transparent opacity={0.3} emissive={shapeColors[0]} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[4, 1, -2]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color={shapeColors[1]} wireframe transparent opacity={0.35} emissive={shapeColors[1]} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 2, -1]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color={shapeColors[2]} wireframe transparent opacity={0.3} emissive={shapeColors[2]} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-2, -1, 1]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.6, 0.2, 16, 32]} />
        <meshStandardMaterial color={shapeColors[3]} wireframe transparent opacity={0.3} emissive={shapeColors[3]} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[3, -2, 0]}>
        <tetrahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color={shapeColors[0]} wireframe transparent opacity={0.25} emissive={shapeColors[0]} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-3, 1.5, -3]}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={shapeColors[1]} wireframe transparent opacity={0.3} emissive={shapeColors[1]} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

// Orbital Rings Component
const OrbitalRings: React.FC<{ variant: string }> = ({ variant }) => {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ring1.current) ring1.current.rotation.z = time * 0.3;
    if (ring2.current) ring2.current.rotation.z = -time * 0.2;
    if (ring3.current) ring3.current.rotation.z = time * 0.25;
  });

  const colors = {
    teams: '#8b5cf6',
    dashboard: '#14b8a6',
    projects: '#f59e0b',
  };

  const color = colors[variant as keyof typeof colors] || colors.teams;

  return (
    <group position={[0, 0, -2]}>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.015, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.01, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

// DNA Helix Component
const DNAHelix: React.FC<{ variant: string }> = ({ variant }) => {
  const helix = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!helix.current) return;
    helix.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  const colors = {
    teams: ['#3b82f6', '#ec4899'],
    dashboard: ['#10b981', '#06b6d4'],
    projects: ['#f59e0b', '#8b5cf6'],
  };

  const helixColors = colors[variant as keyof typeof colors] || colors.teams;
  const points = 20;

  return (
    <group ref={helix} position={[5, 0, -5]}>
      {Array.from({ length: points }).map((_, i) => {
        const angle = (i / points) * Math.PI * 4;
        const y = (i / points) * 6 - 3;
        const radius = 0.8;
        
        return (
          <React.Fragment key={i}>
            <mesh position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={helixColors[0]} emissive={helixColors[0]} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-Math.cos(angle) * radius, y, -Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={helixColors[1]} emissive={helixColors[1]} emissiveIntensity={0.5} />
            </mesh>
          </React.Fragment>
        );
      })}
    </group>
  );
};

// Particle Field Component
const ParticleField: React.FC<{ count: number; variant: string }> = ({ count, variant }) => {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.05;
    points.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });

  const colors = {
    teams: '#8b5cf6',
    dashboard: '#14b8a6',
    projects: '#f59e0b',
  };

  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3));
    return geometry;
  }, [particlesPosition]);

  return (
    <points ref={points} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.02}
        color={colors[variant as keyof typeof colors] || colors.teams}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({ 
  variant = 'teams',
  intensity = 'medium',
  children 
}) => {
  const colorSchemes = {
    teams: {
      primary: ['#3b82f6', '#8b5cf6'],
      secondary: ['#8b5cf6', '#ec4899'],
      tertiary: ['#06b6d4', '#3b82f6'],
    },
    dashboard: {
      primary: ['#10b981', '#14b8a6'],
      secondary: ['#14b8a6', '#06b6d4'],
      tertiary: ['#3b82f6', '#6366f1'],
    },
    projects: {
      primary: ['#f59e0b', '#ef4444'],
      secondary: ['#ec4899', '#8b5cf6'],
      tertiary: ['#f59e0b', '#f97316'],
    },
  };

  const colors = colorSchemes[variant];
  const particleCount = { low: 300, medium: 500, high: 800 }[intensity];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {/* Three.js Canvas */}
      <div className="absolute inset-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} gl={{ alpha: true, antialias: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
          <FloatingShapes variant={variant} />
          <OrbitalRings variant={variant} />
          <DNAHelix variant={variant} />
          <ParticleField count={particleCount} variant={variant} />
        </Canvas>
      </div>

      {/* Animated gradient orbs */}
      <motion.div animate={{ scale: [1, 1.3, 1], x: [0, 100, 0], y: [0, -50, 0], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} style={{ background: `radial-gradient(circle, ${colors.primary[0]}40 0%, transparent 70%)` }} className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl" />
      <motion.div animate={{ scale: [1.2, 1, 1.2], x: [0, -80, 0], y: [0, 60, 0], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }} style={{ background: `radial-gradient(circle, ${colors.secondary[1]}40 0%, transparent 70%)` }} className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl" />
      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }} style={{ background: `radial-gradient(circle, ${colors.tertiary[1]}40 0%, transparent 70%)` }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl" />

      {/* Vertical scanlines */}
      <motion.div animate={{ y: ['-100%', '200%'] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-x-0 h-[2px] opacity-50" style={{ background: `linear-gradient(to bottom, transparent, ${colors.primary[0]}80, transparent)`, boxShadow: `0 0 20px ${colors.primary[0]}60` }} />
      <motion.div animate={{ y: ['200%', '-100%'] }} transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }} className="absolute inset-x-0 h-[1px] opacity-40" style={{ background: `linear-gradient(to bottom, transparent, ${colors.secondary[1]}60, transparent)`, boxShadow: `0 0 15px ${colors.secondary[1]}40` }} />

      {/* Horizontal scanlines grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="absolute left-0 right-0 h-[1px] bg-white" style={{ top: `${i * 1}%` }} />
        ))}
      </div>

      {/* Animated mesh grid */}
      <div className="absolute inset-0 opacity-[0.04]">
        <motion.div animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ backgroundImage: `linear-gradient(${colors.primary[0]}40 1px, transparent 1px), linear-gradient(90deg, ${colors.primary[0]}40 1px, transparent 1px)`, backgroundSize: '50px 50px' }} className="w-full h-full" />
      </div>

      {/* Floating light beams */}
      <motion.div animate={{ x: ['-100%', '200%'], opacity: [0, 0.15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-[300px]" style={{ background: `linear-gradient(90deg, transparent, ${colors.primary[1]}30, transparent)`, transform: 'skewX(-15deg)' }} />
      <motion.div animate={{ x: ['200%', '-100%'], opacity: [0, 0.1, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 5 }} className="absolute inset-y-0 w-[400px]" style={{ background: `linear-gradient(90deg, transparent, ${colors.secondary[0]}20, transparent)`, transform: 'skewX(15deg)' }} />

      {/* Holographic panels */}
      <motion.div animate={{ x: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-1/4 w-64 h-96 border border-blue-500/20 rounded-lg backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)', transform: 'perspective(1000px) rotateY(-20deg)' }} />
      <motion.div animate={{ x: [0, -15, 0], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-1/3 left-1/3 w-48 h-72 border border-purple-500/20 rounded-lg backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, transparent 100%)', transform: 'perspective(1000px) rotateY(15deg)' }} />

      {/* Data stream lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`stream-${i}`}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
          className="absolute h-[1px] w-32"
          style={{ top: `${20 + i * 15}%`, background: `linear-gradient(90deg, transparent, ${colors.primary[0]}60, transparent)` }}
        />
      ))}

      {/* Corner glow effects */}
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-0 w-[500px] h-[500px]" style={{ background: `radial-gradient(circle at top left, ${colors.primary[0]}20, transparent 60%)` }} />
      <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-0 right-0 w-[500px] h-[500px]" style={{ background: `radial-gradient(circle at bottom right, ${colors.secondary[1]}20, transparent 60%)` }} />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(15, 23, 42, 0.4) 100%)' }} />

      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};