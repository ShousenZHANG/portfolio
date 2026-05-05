import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../../../lib/motion.js";

const StableOrbitControls = ({ autoRotate, autoRotateSpeed }) => {
  const gl = useThree((state) => state.gl);
  const [domElement, setDomElement] = useState(null);

  useLayoutEffect(() => {
    setDomElement(gl.domElement);
  }, [gl]);

  if (!domElement) return null;
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      domElement={domElement}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      makeDefault
    />
  );
};

const TechIconCardExperience = ({ model }) => {
  const eventSourceRef = useRef(null);
  const [eventSource, setEventSource] = useState(null);
  const [hovered, setHovered] = useState(false);
  const scene = useGLTF(model.modelPath);
  const reducedMotion = prefersReducedMotion();

  useLayoutEffect(() => {
    setEventSource(eventSourceRef.current);
  }, []);

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

  const frameloop = reducedMotion ? "demand" : "always";
  const floatSpeed = reducedMotion ? 0 : hovered ? 5 : 2.5;
  const rotationIntensity = reducedMotion ? 0 : hovered ? 0.6 : 0.3;
  const floatIntensity = reducedMotion ? 0 : hovered ? 0.9 : 0.5;
  const autoRotate = !reducedMotion;
  const autoRotateSpeed = hovered ? 2.4 : 0.8;

  return (
    <div
      ref={eventSourceRef}
      className="w-full h-full"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {eventSource && (
        <Canvas
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          eventSource={eventSource}
          frameloop={frameloop}
          camera={{ position: [0, 0, 4], fov: 38 }}
        >
          {/* Cinematic 3-light rig: key + fill + cool rim for depth */}
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 5, 5]} intensity={1.1} color="#ffffff" />
          <directionalLight position={[-4, 2, -3]} intensity={0.45} color="#7dd3fc" />
          <pointLight position={[0, -4, 2]} intensity={0.4} color="#34d399" />
          <Environment preset="city" />
          <Float
            speed={floatSpeed}
            rotationIntensity={rotationIntensity}
            floatIntensity={floatIntensity}
          >
            <group scale={model.scale} rotation={model.rotation}>
              <primitive object={scene.scene} />
            </group>
          </Float>
          <StableOrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
          />
        </Canvas>
      )}
    </div>
  );
};

export default TechIconCardExperience;
