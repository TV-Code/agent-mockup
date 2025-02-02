import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Task } from '../types/task';
import { FerroCore } from './FerroCore';
import { TaskScene } from './TaskScene';

interface VisualizationProps {
  tasks: Task[];
  activeTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

export function Visualization({ tasks, activeTaskId, onTaskSelect }: VisualizationProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={window.devicePixelRatio}
      camera={{
        fov: 75,
        position: [0, 0, 5]
      }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#1a1a2e']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />

        {/* Core System */}
        <FerroCore tasks={tasks} activeTaskId={activeTaskId} />
        
        {/* Task Nodes */}
        <TaskScene
          tasks={tasks}
          activeTaskId={activeTaskId}
          onTaskSelect={onTaskSelect}
        />

        {/* Post-processing */}
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
} 