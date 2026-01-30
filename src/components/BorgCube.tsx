import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateBorgTexture } from '../utils/generateBorgTexture';
import './Shield';

export const BorgCube = ({ shieldHits }: { shieldHits: THREE.Vector4[] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const shieldRef = useRef<THREE.ShaderMaterial>(null);

    // Generate texture once on mount
    const texture = useMemo(() => {
        const url = generateBorgTexture();
        const tex = new THREE.TextureLoader().load(url);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }, []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.001;
            meshRef.current.rotation.y += 0.002;
        }

        // Update shield uniforms
        if (shieldRef.current) {
            shieldRef.current.uniforms.uTime.value = clock.getElapsedTime();
            // Pass the impact hits
            shieldRef.current.uniforms.uHits.value = shieldHits;
        }
    });

    return (
        <group>
            {/* The Cube */}
            <mesh ref={meshRef}>
                <boxGeometry args={[3, 3, 3]} />
                <meshStandardMaterial
                    map={texture}
                    roughness={0.2}
                    metalness={0.9}
                />
            </mesh>

            {/* The Shield (Slightly larger) */}
            <mesh>
                <boxGeometry args={[3.2, 3.2, 3.2]} /> {/* Cubic "surface" shield */}
                {/* @ts-ignore */}
                <shieldShaderMaterial
                    ref={shieldRef}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    uColor={new THREE.Color('#00ff00')}
                    uRimColor={new THREE.Color('#ccffcc')}
                />
            </mesh>
        </group>
    );
};
