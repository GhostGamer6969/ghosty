'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SpaceBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add space scene elements here
    // ... (sphere, lights, etc.)

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      // Add animations here
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" />;
}