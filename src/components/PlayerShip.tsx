import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

export const PlayerShip = () => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            {/* 
        Restricted controls to feel like a ship orbiting a large object 
        minDistance prevents clipping inside the cube
      */}
            <OrbitControls
                minDistance={5}
                maxDistance={15}
                enablePan={false}
                target={[0, 0, 0]}
            />
        </>
    );
};
