import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth * 0.45;
    let height = container.clientHeight || window.innerHeight * 0.8;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const pinkColor = new THREE.Color(0xFA1E71);
    const neonPink = new THREE.Color(0xFF4D94);

    // Core Neural Sphere
    const coreGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: pinkColor,
      emissive: pinkColor,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.85,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    // Outer wireframe crystalline shell
    const shellGeometry = new THREE.IcosahedronGeometry(2.0, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: neonPink,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    group.add(shell);

    // Outer geometric ring
    const ringGeometry = new THREE.TorusGeometry(2.6, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: pinkColor,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 3;
    group.add(ring);

    // Orbiting data nodes
    const nodeCount = 14;
    const pivots: THREE.Object3D[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const nodeMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: pinkColor,
        emissiveIntensity: 0.8,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);

      const pivot = new THREE.Object3D();
      pivot.rotation.y = (i / nodeCount) * Math.PI * 2;
      pivot.rotation.x = (Math.random() - 0.5) * Math.PI * 0.8;

      node.position.x = 2.4 + (i % 3) * 0.25;
      pivot.add(node);
      group.add(pivot);
      pivots.push(pivot);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(pinkColor, 2.5, 12);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff4d94, 1.8, 10);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    camera.position.z = 5.8;
    camera.position.x = 0;

    let targetRotY = 0;
    let targetRotX = 0;
    let pointerActive = false;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRotY = nx * 0.85;
      targetRotX = ny * 0.45;
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseleave', onPointerLeave);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (pointerActive) {
        group.rotation.y += (targetRotY - group.rotation.y) * 0.05;
        group.rotation.x += (targetRotX - group.rotation.x) * 0.05;
      } else {
        group.rotation.y += 0.0035;
        group.rotation.x += 0.0012;
      }

      ring.rotation.z += 0.002;

      pivots.forEach((p, idx) => {
        p.rotation.y += 0.008 + idx * 0.0008;
      });

      const pulse = 1 + Math.sin(Date.now() * 0.0022) * 0.045;
      core.scale.setScalar(pulse);
      shell.rotation.y -= 0.002;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth * 0.45;
      height = container.clientHeight || window.innerHeight * 0.8;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.x = 0;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ minHeight: '380px' }}
      title="Interactive Neural Intelligence Matrix - Move cursor to interact"
    />
  );
};
