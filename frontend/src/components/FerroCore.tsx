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
    uColor: new THREE.Color(0x000000),
    uActivity: 0,
    uProgress: 0,
    uDistortion: 0,
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

  // Calculate system metrics
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return { progress: 0, activity: 0, distortion: 0 };

    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const processingTasks = tasks.filter(t => t.status === 'PROCESSING').length;
    
    return {
      progress: completedTasks / totalTasks,
      activity: processingTasks / totalTasks,
      distortion: (processingTasks * 0.7 + completedTasks * 0.3) / totalTasks,
    };
  }, [tasks]);

  // Dynamic color system
  const color = useMemo(() => {
    if (metrics.progress > 0.8) return new THREE.Color('#14B8A6');
    if (metrics.progress > 0.3) return new THREE.Color('#0284C7');
    return new THREE.Color('#4F46E5');
  }, [metrics.progress]);

  // Animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uTime = time;
      materialRef.current.uColor = color;
      materialRef.current.uActivity = metrics.activity;
      materialRef.current.uProgress = metrics.progress;
      materialRef.current.uDistortion = metrics.distortion;
    }

    if (groupRef.current) {
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