import { useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { BorgCube } from './BorgCube';
import { PlayerShip } from './PlayerShip';

// Raycaster component to handle shooting
const Shooter = ({ onHit }: { onHit: (point: THREE.Vector3) => void }) => {
    const { camera, scene, raycaster } = useThree();

    const handleClick = useCallback(() => {
        // Raycast from camera using mouse/center
        // For this simple sim, we assume firing forward from screen center
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        // Find the first hit that isn't the player info?
        // Actually our shield is mesh[1] in the group usually.
        // Let's filter for the shield sphere specifically if possible, 
        // or just the first hit.
        if (intersects.length > 0) {
            onHit(intersects[0].point);
        }
    }, [camera, scene, raycaster, onHit]);

    // Click listener
    useThree(({ gl }) => {
        gl.domElement.addEventListener('click', handleClick);
        return () => {
            gl.domElement.removeEventListener('click', handleClick);
        };
    });

    return null;
};

export default function Experience() {
    const [hits, setHits] = useState<THREE.Vector4[]>(
        Array(5).fill(new THREE.Vector4(0, 0, 0, -100))
    );

    const handleLaserHit = (point: THREE.Vector3) => {
        const time = performance.now() / 1000;

        // Cycle the hits buffer (simple round robin)
        setHits(prev => {
            const next = [...prev];
            next.shift(); // Remove oldest
            next.push(new THREE.Vector4(point.x, point.y, point.z, time));
            return next;
        });

        // Optional: Laser Beam Visual could trigger here
        console.log("Pew! Hit at:", point);
    };

    return (
        // Black background for space
        <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
            <Canvas>
                <color attach="background" args={['#050505']} />

                <PlayerShip />
                <Shooter onHit={handleLaserHit} />

                <ambientLight intensity={0.1} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <pointLight position={[-10, -5, -5]} color="#55ff55" intensity={0.5} distance={20} />

                <BorgCube shieldHits={hits} />

                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        intensity={2.0}
                        radius={0.4}
                    />
                </EffectComposer>

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Canvas>

            {/* Simple UI Overlay */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#0f0',
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                textShadow: '0 0 10px #0f0',
                pointerEvents: 'none',
                textAlign: 'center'
            }}>
                BORG TACTICAL SIMULATION<br />
                <span style={{ fontSize: '0.8rem', color: '#fff' }}>CLICK TO FIRE</span>
            </div>
        </div>
    );
}
