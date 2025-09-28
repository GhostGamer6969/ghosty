'use client';

import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

interface ThreeSceneProps {
  onReachedEdge?: () => void;
}

export default function ThreeScene({ onReachedEdge }: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Make background transparent
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls for zoom and movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Load the spaceship OBJ model
    const loader = new OBJLoader();
    loader.load('/model.obj', (obj) => {
      modelRef.current = obj;
      
      // Scale the model
      obj.scale.set(0.005, 0.005, 0.005);
      
      // Set random starting position from edges
      const startingEdges = [
        { x: -10, y: (Math.random() * 10) - 5 },   // left edge
        { x: 10, y: (Math.random() * 10) - 5 },    // right edge
        { x: (Math.random() * 20) - 10, y: 5 },    // top edge
        { x: (Math.random() * 20) - 10, y: -5 }    // bottom edge
      ];
      
      const startPos = startingEdges[Math.floor(Math.random() * startingEdges.length)];
      obj.position.set(startPos.x, startPos.y, 0);
      
      // Tilt the model
      obj.rotation.y = Math.PI / 4;
      
      scene.add(obj);
    }, undefined, (error) => {
      console.error('Error loading OBJ model:', error);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 7);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.0005;
      
      if (modelRef.current) {
        // Rotate the model
        modelRef.current.rotation.z += 0.005;
        
        // Gentle drift movement
        modelRef.current.position.x += Math.sin(time) * 0.02;
        modelRef.current.position.y += Math.cos(time) * 0.01;
        
        // Check boundaries
        const limitX = 9;
        const limitY = 4;
        
        if (
          modelRef.current.position.x >= limitX ||
          modelRef.current.position.x <= -limitX ||
          modelRef.current.position.y >= limitY ||
          modelRef.current.position.y <= -limitY
        ) {
          onReachedEdge?.();
        }
      }
      
      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onReachedEdge]); // Add onReachedEdge to dependency array

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0"
      style={{ 
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/13404.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'brightness(0.7)'
      }}
    />
  );
}
