'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere({ position, color, speed, distort }: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const count = 500;
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    return geo;
  }, [particles]);

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        color="#60a5fa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />

      <AnimatedSphere position={[-3, 1, -2]} color="#3b82f6" speed={1.5} distort={0.4} />
      <AnimatedSphere position={[3, -1, -3]} color="#8b5cf6" speed={1.2} distort={0.3} />
      <AnimatedSphere position={[0, 2, -4]} color="#06b6d4" speed={1} distort={0.5} />

      <ParticleField />
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
    </div>
  );
}
