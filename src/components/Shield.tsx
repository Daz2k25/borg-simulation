import * as THREE from 'three';
import { extend, ReactThreeFiber } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// Uniforms for the shield
type ShieldUniforms = {
    uTime: number;
    uColor: THREE.Color;
    uRimColor: THREE.Color;
    uHits: THREE.Vector4[]; // xyz = position, w = time of impact
};

const ShieldShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#00ff00'),
        uRimColor: new THREE.Color('#ffffff'),
        uHits: Array(5).fill(new THREE.Vector4(0, 0, 0, -100)), // Initialize off-screen/old
    },
    // Vertex Shader
    `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uRimColor;
    uniform vec4 uHits[5]; // Up to 5 simultaneous ripples

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      vec3 normal = normalize(vNormal);
      
      // Fresnel Effect (Rim lighting)
      float fresnel = 1.0 - dot(viewDir, normal);
      fresnel = pow(fresnel, 3.0);
      
      // Ripples from hits
      float rippleIntensity = 0.0;
      
      for(int i = 0; i < 5; i++) {
        vec3 hitPos = uHits[i].xyz;
        float hitTime = uHits[i].w;
        
        float timeSinceHit = uTime - hitTime;
        if(timeSinceHit > 0.0 && timeSinceHit < 2.0) {
          float dist = distance(vPosition, hitPos);
          // Ring expands over time
          float radius = timeSinceHit * 2.0;
          float ringWidth = 0.2;
          
          if(dist > radius && dist < radius + ringWidth) {
             // Fade out over time
             float fade = 1.0 - (timeSinceHit / 2.0);
             rippleIntensity += fade * 2.0; 
          }
        }
      }

      // Hexagon Grid Pattern (Optional detail)
      // Simple grid based on UV
      float grid = step(0.98, fract(vUv.x * 50.0)) + step(0.98, fract(vUv.y * 50.0));
      
      // Combine
      float alpha = fresnel * 0.4 + rippleIntensity * 0.5 + grid * 0.1;
      alpha = clamp(alpha, 0.0, 1.0); // Clamped so we don't blow out

      // Color Mix: Base + Ripple/Rim adds white
      vec3 finalColor = mix(uColor, uRimColor, fresnel + rippleIntensity);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

extend({ ShieldShaderMaterial });

// Add type definition for JSX
declare global {
    namespace JSX {
        interface IntrinsicElements {
            shieldShaderMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof ShieldShaderMaterial> & ShieldUniforms;
        }
    }
}

export { ShieldShaderMaterial };
