import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { Task } from '../types/task';
import { vertexShader, fragmentShader } from '../shaders/FerroShader';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';

// Create custom shader material
const FerroMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#ffa07a'),
    uActivity: 0,
    uDistortion: 0,
    uThinkingState: 0
  },
  vertexShader,
  fragmentShader
);

// Extend Three.js materials with our custom material
extend({ FerroMaterial });

interface FerroCoreProps {
  tasks: Task[];
  activeTaskId: string | null;
}

export function FerroCore({ tasks, activeTaskId }: FerroCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);
  const thinkingRef = useRef(0);

  // Calculate system metrics
  const metrics = useMemo(() => {
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const isProcessing = activeTask?.status === 'PROCESSING';

    return {
      progress: 0.35,       // Moderate progress for good base energy
      activity: 0.45,       // Higher activity for fluid movement
      distortion: 0.3,      // Moderate distortion for fluid surface
      isThinking: isProcessing  // Only think when actually processing
    };
  }, [tasks, activeTaskId]);

  // Base color - never changes
  const color = useMemo(() => new THREE.Color('#ffa07a'), []);

  // Animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
  
    if (materialRef.current) {
      materialRef.current.uTime = time;
      materialRef.current.uColor = color;
      materialRef.current.uActivity = metrics.activity;
      materialRef.current.uProgress = metrics.progress;
      
      // Simple thinking state transition
      thinkingRef.current += (metrics.isThinking ? 1 : -1) * 0.05;
      thinkingRef.current = Math.max(0, Math.min(1, thinkingRef.current));
      
      materialRef.current.uThinkingState = thinkingRef.current;
      materialRef.current.uDistortion = metrics.distortion;
    }
  
    if (groupRef.current) {
      // Simple consistent rotation
      groupRef.current.rotation.y += 0.001 + metrics.activity * 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core ferrofluid surface */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 196]} />
        {/* @ts-ignore */}
        <ferroMaterial 
          ref={materialRef} 
          transparent 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner energy glow */}
      <Sphere args={[0.96, 196, 196]}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          metalness={1.0}
          roughness={0.02}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Dynamic particle field */}
      <points>
        <sphereGeometry args={[1.2, 128, 128]} />
        <pointsMaterial
          size={0.008}
          color={color}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={0.5}
          kernelSize={2}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.1}
        />
        <Noise opacity={0.02} />
      </EffectComposer>
    </group>
  );
}