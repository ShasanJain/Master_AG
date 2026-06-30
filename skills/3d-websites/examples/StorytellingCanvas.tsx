import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StorytellingCanvasProps {
  primaryModelUrl: string;
  secondaryModelUrl: string;
  theme?: 'dark' | 'light';
  onAssetClick?: (label: string) => void;
  ambientVolume?: number;
}

export const StorytellingCanvas: React.FC<StorytellingCanvasProps> = ({
  primaryModelUrl,
  secondaryModelUrl,
  theme = 'dark',
  onAssetClick,
  ambientVolume = 0.4,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- WebGL Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    containerRef.current.appendChild(renderer.domElement);

    // --- Audio Nodes & Interaction ---
    const ambientAudio = new Audio('https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg');
    ambientAudio.loop = true;
    ambientAudio.volume = ambientVolume;
    audioRef.current = ambientAudio;

    const playAudio = () => {
      ambientAudio.play().catch(() => {
        // Fallback for user interaction policies
      });
      window.removeEventListener('click', playAudio);
    };
    window.addEventListener('click', playAudio);

    // --- Lighting Grid ---
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 0.5 : 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);

    // --- Deep Space Particles ---
    const pCount = 1500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
      pPos[i] = (Math.random() - 0.5) * 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- GLTF Asset Loader ---
    const loader = new GLTFLoader();
    let model1: THREE.Group | null = null;
    let model2: THREE.Group | null = null;

    const loadAsset = (url: string, index: number) => {
      loader.load(
        url,
        (gltf) => {
          const loadedModel = gltf.scene;
          scene.add(loadedModel);
          if (index === 1) {
            model1 = loadedModel;
            model1.position.set(1.0, 0, 0);
            model1.scale.set(10, 10, 10);
          } else {
            model2 = loadedModel;
            model2.position.set(-1.0, -0.5, -1);
            model2.scale.set(0.6, 0.6, 0.6);
          }
          setLoadingProgress((prev) => prev + 50);
        },
        undefined,
        (err) => console.error('Error loading asset', err)
      );
    };

    loadAsset(primaryModelUrl, 1);
    loadAsset(secondaryModelUrl, 2);

    // --- Raycaster Click ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        let rootNode: THREE.Object3D | null = intersects[0].object;
        while (rootNode && rootNode.parent !== scene) {
          rootNode = rootNode.parent;
        }
        if (rootNode) {
          const hitLabel = rootNode === model1 ? 'Primary Model' : 'Secondary Model';
          setSelectedAsset(hitLabel);
          if (onAssetClick) onAssetClick(hitLabel);

          // Bounce effect on click
          gsap.to(rootNode.scale, {
            x: rootNode.scale.x * 1.15,
            y: rootNode.scale.y * 1.15,
            z: rootNode.scale.z * 1.15,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: 'power1.inOut',
          });
        }
      }
    };
    window.addEventListener('click', handleCanvasClick);

    // --- GSAP Scroll-linked Timeline ---
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    });

    // Animate camera position and particles on scroll
    tl.to(camera.position, { x: 1.2, y: 0.5, z: 3.0, duration: 1 }, 0)
      .to(particles.rotation, { y: Math.PI * 0.25, duration: 1 }, 0)
      .to(camera.position, { x: -1.0, y: -0.2, z: 2.2, duration: 1 }, 1)
      .to(particles.rotation, { y: -Math.PI * 0.25, duration: 1 }, 1);

    // Mouse Parallax Engine
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (model1) {
        gsap.to(model1.rotation, {
          y: normX * 0.2,
          x: normY * 0.2,
          duration: 0.8,
        });
      }
      if (model2) {
        gsap.to(model2.rotation, {
          y: normX * 0.1,
          x: normY * 0.1,
          duration: 1.0,
        });
      }
      gsap.to(particles.rotation, {
        y: normX * 0.05,
        x: normY * 0.05,
        duration: 1.2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // --- Strict Memory Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('click', playAudio);
      window.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      ambientAudio.pause();
      ambientAudio.remove();

      // Recursive disposal of Three.js objects
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      pGeo.dispose();
      pMat.dispose();

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [primaryModelUrl, secondaryModelUrl, theme, ambientVolume, onAssetClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />
      {loadingProgress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-50">
          <span className="text-xs font-mono tracking-widest text-indigo-400">
            LOADING STAGE: {loadingProgress}%
          </span>
        </div>
      )}
    </div>
  );
};
