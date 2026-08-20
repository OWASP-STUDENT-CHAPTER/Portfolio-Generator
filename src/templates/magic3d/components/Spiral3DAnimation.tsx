"use client";

import React, { useEffect, useRef } from "react";

class Vector3D {
  constructor(public x: number, public y: number, public z: number) {}
}

class Star {
  public pos: Vector3D;
  public trail: Vector3D[] = [];
  public speed: number;
  public angle: number;
  public radius: number;
  public yOffset: number;

  constructor(
    private cameraZ: number,
    private travelDist: number,
    private numberOfStars: number,
    index: number
  ) {
    this.angle = (index / numberOfStars) * Math.PI * 8;
    this.radius = 40 + Math.random() * 260;
    this.speed = 1.2 + Math.random() * 1.8;
    this.yOffset = (Math.random() - 0.5) * 40;
    this.pos = new Vector3D(
      Math.cos(this.angle) * this.radius,
      Math.sin(this.angle) * this.radius * 0.4 + this.yOffset,
      Math.random() * this.travelDist + this.cameraZ
    );
  }

  update(mouseDeltaX: number, mouseDeltaY: number) {
    this.trail.push(new Vector3D(this.pos.x, this.pos.y, this.pos.z));
    if (this.trail.length > 8) {
      this.trail.shift();
    }

    this.pos.z -= this.speed * 2.5;
    this.angle += 0.006;
    this.pos.x = Math.cos(this.angle) * this.radius + mouseDeltaX * 12;
    this.pos.y = Math.sin(this.angle) * this.radius * 0.35 + this.yOffset + mouseDeltaY * 12;

    if (this.pos.z < this.cameraZ) {
      this.pos.z = this.travelDist + this.cameraZ;
      this.trail = [];
    }
  }
}

export function Spiral3DAnimation({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / width - 0.5) * 2,
        y: (e.clientY / height - 0.5) * 2,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const numStars = 220;
    const cameraZ = -300;
    const travelDist = 2400;
    const fov = 350;

    const stars: Star[] = Array.from(
      { length: numStars },
      (_, i) => new Star(cameraZ, travelDist, numStars, i)
    );

    const project = (v: Vector3D) => {
      const scale = fov / (v.z - cameraZ);
      return {
        x: width / 2 + v.x * scale,
        y: height / 2 + v.y * scale,
        scale,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const starColor = isDark ? "255, 255, 255" : "30, 41, 59";
      const glowColor = isDark ? "147, 197, 253" : "99, 102, 241";

      for (const star of stars) {
        star.update(mouseRef.current.x, mouseRef.current.y);

        const p = project(star.pos);
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.scale <= 0) {
          continue;
        }

        const size = Math.max(0.75, Math.min(3.5, p.scale * 1.5));
        const alpha = Math.min(1, Math.max(0.1, p.scale * 0.8));

        // Draw star trail
        if (star.trail.length > 1) {
          ctx.beginPath();
          const first = project(star.trail[0]);
          ctx.moveTo(first.x, first.y);
          for (let i = 1; i < star.trail.length; i++) {
            const tp = project(star.trail[i]);
            ctx.lineTo(tp.x, tp.y);
          }
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(${glowColor}, ${alpha * 0.25})`;
          ctx.lineWidth = size * 0.6;
          ctx.stroke();
        }

        // Draw star dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}
