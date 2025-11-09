"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Geometry, Base, Subtraction} from '@react-three/csg'
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Bloom, N8AO, SMAA, EffectComposer } from '@react-three/postprocessing'
import { useRef } from "react";
import { Mesh } from "three";
import { KernelSize } from "postprocessing";

function Shape() {
  const meshRef = useRef<Mesh>(null);
  const innerSphereRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slower, more organic breathing motion
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.z += delta * 0.1;
      
      // Breathing scale effect - like Earth breathing
      const breathe = Math.sin(state.clock.elapsedTime * 0.8) * 0.05 + 1;
      meshRef.current.scale.set(breathe, breathe, breathe);
    }
    if (innerSphereRef.current) {
      // Counter-rotation for inner sphere
      innerSphereRef.current.rotation.x += delta * 0.15;
      innerSphereRef.current.rotation.y += delta * 0.25;
      innerSphereRef.current.rotation.z += delta * 0.05;
      
      // Heartbeat-like pulsing
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      innerSphereRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <meshPhysicalMaterial 
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color="#0f172a"
        />

        <Geometry>
          <Base>
            <primitive
              object={new RoundedBoxGeometry(2, 2, 2, 7, 0.2)}
            />
          </Base>

          <Subtraction>
            <sphereGeometry args={[1.25, 64, 64]} />
          </Subtraction>
        </Geometry>
      </mesh>
      
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          emissive="white"
          emissiveIntensity={1}
        />
      </mesh>
    </>
  );
}

function Environment() {
  return (
    <>
      {/* Soft green ambient light */}
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.2} 
        color="#22c55e"
      />
      
      {/* Cool green glow */}
      <directionalLight 
        position={[0, -5, 10]} 
        intensity={0.4} 
        color="#10b981"
      />
      
      {/* Dark ambient */}
      <ambientLight intensity={0.3} color="#1e293b" />
      
      {/* Subtle green accent */}
      <pointLight 
        position={[8, 3, 8]} 
        intensity={0.2} 
        color="#16a34a"
        distance={20}
      />
      
      {/* Green key light */}
      <pointLight 
        position={[-8, 3, -8]} 
        intensity={0.3} 
        color="#15803d"
        distance={20}
      />
      
      {/* Deep space feeling */}
      <directionalLight 
        position={[0, -10, 0]} 
        intensity={0.1} 
        color="#0f172a"
      />
    </>
  );
}

function Scene() {
  return (
    <Canvas
      className="w-full h-full"
      camera={{ position: [5, 5, 5], fov: 50 }}
    >
      <Environment />
      <Shape />
      <EffectComposer multisampling={0}>
        <N8AO halfRes color="black" aoRadius={2} intensity={1} aoSamples={6} denoiseSamples={4} />
        <Bloom
          kernelSize={3}
          luminanceThreshold={0}
          luminanceSmoothing={0.4}
          intensity={0.6}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={0.5}
        />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}

function Navbar({ links }: { links: Array<{ name: string; href: string }> }) {

  return (
    <nav className="absolute top-4 left-4 right-4 md:top-10 md:left-10 md:right-10 z-30">
      <ul className="hidden md:flex gap-8 lg:gap-12">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-sm font-light tracking-[0.2em] text-green-200 hover:text-green-400 transition-colors duration-300"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
      
      <ul className="md:hidden flex flex-col gap-3 items-end">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-xs font-light tracking-[0.15em] text-green-200 hover:text-green-400 transition-colors duration-300"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface HeroProps {
  title: string;
  description: string;
  links: Array<{ name: string; href: string }>;
  onStartClick?: () => void;
  onLearnMoreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ title, description, links, onStartClick, onLearnMoreClick }) => {
  const handleStartClick = () => {
    if (onStartClick) {
      onStartClick();
    } else {
      // Default action: scroll to mission or navigate to connect page
      window.location.href = '/connect';
    }
  };

  const handleLearnMoreClick = () => {
    if (onLearnMoreClick) {
      onLearnMoreClick();
    } else {
      // Default action: navigate to mission page
      window.location.href = '/mission';
    }
  };

  return (
    <div className="h-svh w-screen relative bg-gradient-to-br from-black via-slate-900 to-green-950">
      <Navbar links={links} />
      <div className="absolute inset-0">
        <Scene />
      </div>
      <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-20 max-w-lg">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-3 text-green-100">
            {title}
        </h1>
        <p className="font-mono text-xs md:text-sm leading-relaxed font-light tracking-tight text-slate-300/80 mb-6">
            {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleStartClick}
            className="group relative overflow-hidden bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
          >
            <span className="relative z-10 font-medium">Start with AIVA</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button 
            onClick={handleLearnMoreClick}
            className="border border-green-500/50 text-green-200 hover:text-green-100 px-8 py-3 rounded-lg hover:bg-green-800/20 transition-all duration-300"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}