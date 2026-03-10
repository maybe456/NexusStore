// src/components/LavaLampBackground.jsx
import { useEffect, useRef, useState, useCallback } from "react";

const LavaLampBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const blobsRef = useRef([]);

  // Initialize blobs
  useEffect(() => {
    const colors = [
      { r: 99, g: 102, b: 241, a: 0.4 },   // primary indigo
      { r: 217, g: 70, b: 239, a: 0.35 },  // accent fuchsia
      { r: 168, g: 85, b: 247, a: 0.3 },   // purple
      { r: 236, g: 72, b: 153, a: 0.35 },  // pink
      { r: 59, g: 130, b: 246, a: 0.3 },   // blue
      { r: 14, g: 165, b: 233, a: 0.25 },  // cyan
    ];

    // Create initial blobs
    blobsRef.current = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 80 + Math.random() * 150,
      targetRadius: 80 + Math.random() * 150,
      color: colors[i % colors.length],
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.002 + Math.random() * 0.003,
      wobbleX: Math.random() * Math.PI * 2,
      wobbleY: Math.random() * Math.PI * 2,
      wobbleSpeedX: 0.01 + Math.random() * 0.02,
      wobbleSpeedY: 0.01 + Math.random() * 0.02,
    }));
  }, []);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const blobs = blobsRef.current;

      blobs.forEach((blob, index) => {
        // Calculate distance from mouse
        const dx = mouse.x - blob.x;
        const dy = mouse.y - blob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 300;

        // Mouse interaction - push blobs away and make them grow
        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 2;
          blob.vx -= (dx / distance) * force * 0.1;
          blob.vy -= (dy / distance) * force * 0.1;
          blob.targetRadius = (80 + Math.random() * 150) * (1 + force * 0.3);
        } else {
          blob.targetRadius = 80 + Math.random() * 150;
        }

        // Smooth radius transition
        blob.radius += (blob.targetRadius - blob.radius) * 0.02;

        // Update wobble
        blob.wobbleX += blob.wobbleSpeedX;
        blob.wobbleY += blob.wobbleSpeedY;

        // Apply velocity with wobble
        blob.x += blob.vx + Math.sin(blob.wobbleX) * 0.5;
        blob.y += blob.vy + Math.cos(blob.wobbleY) * 0.5;

        // Apply friction
        blob.vx *= 0.98;
        blob.vy *= 0.98;

        // Add slight random movement
        blob.vx += (Math.random() - 0.5) * 0.05;
        blob.vy += (Math.random() - 0.5) * 0.05;

        // Boundary bounce with soft edges
        const margin = blob.radius;
        if (blob.x < margin) {
          blob.x = margin;
          blob.vx *= -0.5;
        }
        if (blob.x > canvas.width - margin) {
          blob.x = canvas.width - margin;
          blob.vx *= -0.5;
        }
        if (blob.y < margin) {
          blob.y = margin;
          blob.vy *= -0.5;
        }
        if (blob.y > canvas.height - margin) {
          blob.y = canvas.height - margin;
          blob.vy *= -0.5;
        }

        // Pulse effect
        blob.phase += blob.pulseSpeed;
        const pulseScale = 1 + Math.sin(blob.phase) * 0.1;
        const drawRadius = blob.radius * pulseScale;

        // Draw blob with radial gradient
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, drawRadius
        );
        
        const { r, g, b, a } = blob.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * 0.8})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${a * 0.5})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${a * 0.2})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw inner glow
        const innerGradient = ctx.createRadialGradient(
          blob.x - drawRadius * 0.2, blob.y - drawRadius * 0.2, 0,
          blob.x, blob.y, drawRadius * 0.6
        );
        innerGradient.addColorStop(0, `rgba(255, 255, 255, ${a * 0.3})`);
        innerGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, drawRadius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = innerGradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        filter: "blur(40px)",
        opacity: 0.7,
      }}
    />
  );
};

export default LavaLampBackground;
