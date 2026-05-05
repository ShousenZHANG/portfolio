import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../../../lib/motion.js";

const StableOrbitControls = () => {
  const gl = useThree((state) => state.gl);
  const [domElement, setDomElement] = useState(null);

  useLayoutEffect(() => {
    setDomElement(gl.domElement);
  }, [gl]);

  if (!domElement) return null;
  return <OrbitControls enableZoom={false} domElement={domElement} />;
};

const TechIconCardExperience = ({ model }) => {
  const eventSourceRef = useRef(null);
  const [eventSource, setEventSource] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const scene = useGLTF(model.modelPath);
  const reducedMotion = prefersReducedMotion();

  useLayoutEffect(() => {
    setEventSource(eventSourceRef.current);
  }, []);

  // Only run the GPU loop while the card is in viewport — saves battery on
  // pages with multiple Canvas instances, especially on laptops/phones.
  useEffect(() => {
    const node = eventSourceRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(node);
    return () => observer.disconnect();
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

  // Pick frameloop dynamically: pause when off-screen, freeze when user
  // prefers reduced motion (Float keeps running otherwise).
  const frameloop = reducedMotion ? "demand" : isVisible ? "always" : "never";

  return (
    <div ref={eventSourceRef} className="w-full h-full">
      {eventSource && (
        <Canvas
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          eventSource={eventSource}
          frameloop={frameloop}
        >
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Environment preset="city" />
          <Float
            speed={reducedMotion ? 0 : 3}
            rotationIntensity={reducedMotion ? 0 : 0.3}
            floatIntensity={reducedMotion ? 0 : 0.5}
          >
            <group scale={model.scale} rotation={model.rotation}>
              <primitive object={scene.scene} />
            </group>
          </Float>
          <StableOrbitControls />
        </Canvas>
      )}
    </div>
  );
};

export default TechIconCardExperience;
