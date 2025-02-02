import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Task } from '../types/task';

interface TaskParticleSystemProps {
  task: Task;
  color?: string;
  count?: number;
}

export function TaskParticleSystem({ 
  task, 
  color = '#61dafb', 
  count = 1000 
}: TaskParticleSystemProps) {
  const points = useRef<THREE.Points>(null);
  
  // Generate particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const radius = 2;
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      // Rotate based on task progress
      points.current.rotation.y += 0.001 * (task.progress / 100 + 1);
      
      // Scale particles based on task status
      const scale = task.status === 'PROCESSING' 
        ? 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2 
        : 1;
      points.current.scale.setScalar(scale);
      
      // Update particle positions
      const positions = points.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // Add some noise to particle positions
        positions[i] += Math.sin(state.clock.elapsedTime + i) * 0.001;
        positions[i + 1] += Math.cos(state.clock.elapsedTime + i) * 0.001;
        positions[i + 2] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={color}
      />
    </Points>
  );
} 