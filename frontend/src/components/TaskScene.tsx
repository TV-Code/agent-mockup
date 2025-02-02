import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Task } from '../types/task';

interface TaskSceneProps {
  tasks: Task[];
  activeTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

export function TaskScene({ tasks, activeTaskId, onTaskSelect }: TaskSceneProps) {
  const coreRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create geometries
  const nodeGeometry = useMemo(() => new THREE.SphereGeometry(0.2, 16, 16), []);
  const ringGeometry = useMemo(() => new THREE.RingGeometry(0.25, 0.3, 32), []);

  // Calculate task positions
  const getTaskPosition = (index: number, total: number) => {
    const status = tasks[index].status;
    const baseAngle = (index / total) * Math.PI * 2;
    const radius = status === 'COMPLETED' ? 2.5 : status === 'PROCESSING' ? 2 : 1.5;
    const heightOffset = status === 'COMPLETED' ? 0.5 : status === 'PROCESSING' ? 0 : -0.5;
    
    return [
      Math.cos(baseAngle) * radius,
      Math.sin(baseAngle) * radius,
      heightOffset
    ] as const;
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (coreRef.current) {
      coreRef.current.rotation.y += 0.005;
      const scale = 1 + Math.sin(time * 2) * 0.05;
      coreRef.current.scale.setScalar(scale);
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Lights */}
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />

      {/* Core */}
      <group ref={coreRef}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color="#2a9fff"
            emissive="#2a9fff"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Tasks */}
      {tasks.map((task, index) => {
        const [x, y, z] = getTaskPosition(index, tasks.length);
        const isActive = task.id === activeTaskId;

        return (
          <group key={task.id} position={[x, y, z]}>
            <Float
              speed={2}
              rotationIntensity={0}
              floatIntensity={isActive ? 0.5 : 0.2}
            >
              <mesh
                geometry={nodeGeometry}
                onClick={() => onTaskSelect(task.id)}
              >
                <meshStandardMaterial
                  color={
                    task.status === 'COMPLETED' ? '#4CAF50' :
                    task.status === 'PROCESSING' ? '#2196F3' :
                    '#FFC107'
                  }
                  emissive={
                    task.status === 'COMPLETED' ? '#4CAF50' :
                    task.status === 'PROCESSING' ? '#2196F3' :
                    '#FFC107'
                  }
                  emissiveIntensity={isActive ? 0.5 : 0.2}
                />
              </mesh>

              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.25, 0.3, 32]} />
                <meshBasicMaterial
                  color="#2a9fff"
                  transparent
                  opacity={0.2}
                  side={THREE.DoubleSide}
                />
              </mesh>

              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry
                  args={[0.25, 0.3, 32, 1, 0, (task.progress / 100) * Math.PI * 2]}
                />
                <meshBasicMaterial
                  color={
                    task.status === 'COMPLETED' ? '#4CAF50' :
                    task.status === 'PROCESSING' ? '#2196F3' :
                    '#FFC107'
                  }
                  side={THREE.DoubleSide}
                />
              </mesh>

              {isActive && (
                <Text
                  position={[0, 0.4, 0]}
                  fontSize={0.15}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={2}
                  outlineWidth={0.02}
                  outlineColor="#000000"
                >
                  {task.description}
                </Text>
              )}
            </Float>
          </group>
        );
      })}
    </group>
  );
} 