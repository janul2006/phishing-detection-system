import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Constellation({ isScanning, result }) {
  const count = 180;
  const pointsRef = useRef();
  const linesRef = useRef();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = 12 * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i*3+2] = r * Math.cos(phi);
        
        vel[i*3] = (Math.random() - 0.5) * 0.02;
        vel[i*3+1] = (Math.random() - 0.5) * 0.02;
        vel[i*3+2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  const targetColor = useRef(new THREE.Color("#00D2FF")); // Cyber Blue
  
  useEffect(() => {
    if (isScanning) {
      targetColor.current.set("#00D2FF");
    } else if (result) {
      if (result.result === 'phishing') {
        targetColor.current.set("#FF4B2B"); // Crimson Red
      } else {
        targetColor.current.set("#00F5A0"); // Emerald Green
      }
    } else {
      targetColor.current.set("#00D2FF");
    }
  }, [isScanning, result]);

  const matColor = useRef(new THREE.Color("#00D2FF"));
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!pointsRef.current || !linesRef.current) return;

    matColor.current.lerp(targetColor.current, 0.05);

    // Chaos flicker for phishing
    if (result && result.result === 'phishing' && !isScanning) {
       const flicker = Math.random() > 0.7 ? 0.4 : 1.2;
       pointsRef.current.material.color.set(matColor.current).multiplyScalar(flicker);
       linesRef.current.material.color.set(matColor.current).multiplyScalar(flicker);
    } else {
       pointsRef.current.material.color.copy(matColor.current);
       linesRef.current.material.color.copy(matColor.current);
    }

    const positionsArray = pointsRef.current.geometry.attributes.position.array;
    
    // Group mouse interactivity drift
    pointsRef.current.rotation.y += (pointer.x * 0.5 - pointsRef.current.rotation.y) * 0.05;
    pointsRef.current.rotation.x += (-pointer.y * 0.5 - pointsRef.current.rotation.x) * 0.05;
    pointsRef.current.rotation.z += delta * 0.05;
    linesRef.current.rotation.copy(pointsRef.current.rotation);

    const pullStrength = isScanning ? 0.08 : 0; 
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
        let x = positionsArray[i*3];
        let y = positionsArray[i*3+1];
        let z = positionsArray[i*3+2];

        if (isScanning) {
            // Rapid suction toward center (data extraction simulation)
            x -= x * pullStrength + (Math.sin(time*10+i) * 0.05);
            y -= y * pullStrength + (Math.cos(time*10+i) * 0.05);
            z -= z * pullStrength + (Math.sin(time*5+i) * 0.05);

            if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5 && Math.abs(z) < 0.5) {
                // Respawn particle outward
                const r = 15;
                const theta = Math.random() * 2 * Math.PI;
                const phi = Math.acos(2 * Math.random() - 1);
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            }
        } else {
            // Idle drift
            x += velocities[i*3];
            y += velocities[i*3+1];
            z += velocities[i*3+2];
            
            if (x > 15) x = -15; if (x < -15) x = 15;
            if (y > 15) y = -15; if (y < -15) y = 15;
            if (z > 15) z = -15; if (z < -15) z = 15;
        }

        positionsArray[i*3] = x;
        positionsArray[i*3+1] = y;
        positionsArray[i*3+2] = z;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Draw dynamic connections
    const indices = [];
    for (let i=0; i<count; i++) {
        for(let j=i+1; j<count; j++) {
            const dx = positionsArray[i*3] - positionsArray[j*3];
            const dy = positionsArray[i*3+1] - positionsArray[j*3+1];
            const dz = positionsArray[i*3+2] - positionsArray[j*3+2];
            // Connection threshold
            if ((dx*dx + dy*dy + dz*dz) < 6) {
               indices.push(i, j);
            }
        }
    }
    linesRef.current.geometry.setIndex(indices);
    linesRef.current.geometry.setAttribute('position', pointsRef.current.geometry.attributes.position);
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#00D2FF" transparent opacity={0.9} sizeAttenuation={true} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
           <bufferAttribute 
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00D2FF" transparent opacity={0.12} />
      </lineSegments>
    </group>
  );
}

export default function DataConstellation({ isScanning, result }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={1} />
        <Constellation isScanning={isScanning} result={result} />
      </Canvas>
    </div>
  );
}
