import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

const TechIconCardExperience = ({ model }) => {
  const scene = useGLTF(model.modelPath);

  useEffect(() => {
    if (model.name !== "Interactive Developer") return;
    const material = new THREE.MeshStandardMaterial({ color: "white" });
    scene.scene.traverse((child) => {
      if (child.isMesh && child.name === "Object_5") {
        child.material = material;
      }
    });
    return () => material.dispose();
  }, [scene, model.name]);

  return (
    <Canvas dpr={[1, 1.5]} performance={{ min: 0.5 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Environment preset="city" />
      <Float speed={3} rotationIntensity={0.3} floatIntensity={0.5}>
        <group scale={model.scale} rotation={model.rotation}>
          <primitive object={scene.scene} />
        </group>
      </Float>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default TechIconCardExperience;
