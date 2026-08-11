"use client";

import Image from "next/image";
import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SkillsFallbackGrid } from "./SkillsFallbackGrid";
import type { Skill } from "./skillsData";
import {
  createFibonacciSphere,
  createNearestConnections,
  rotatePoint,
} from "./sphereMath";

type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
  depth: number;
  scale: number;
};

const MAX_PITCH = 1.12;

export function SkillSphere({ skills }: { skills: Skill[] }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const dimensionsRef = useRef({ width: 760, height: 760, radius: 300 });
  const rotationRef = useRef({ yaw: -0.45, pitch: 0.1 });
  const velocityRef = useRef({ yaw: 0, pitch: 0 });
  const pointerRef = useRef({ id: -1, x: 0, y: 0, dragging: false });
  const activeIndexRef = useRef(-1);
  const focusedWithinRef = useRef(false);
  const visibleRef = useRef(true);
  const tabVisibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const lastFrameRef = useRef(0);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);

  const points = useMemo(
    () => createFibonacciSphere(skills.length),
    [skills.length],
  );
  const connections = useMemo(
    () => createNearestConnections(points, 2),
    [points],
  );

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) {
      setReady(true);
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    const resize = () => {
      const bounds = shell.getBoundingClientRect();
      const width = Math.max(320, bounds.width);
      const height = Math.max(320, bounds.height);
      const radius = Math.max(118, Math.min(width, height) * 0.385);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      dimensionsRef.current = { width, height, radius };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (time: number) => {
      frameRef.current = window.requestAnimationFrame(render);
      if (!visibleRef.current || !tabVisibleRef.current) {
        lastFrameRef.current = time;
        return;
      }

      const delta = Math.min(34, Math.max(0, time - lastFrameRef.current));
      lastFrameRef.current = time;
      const pointer = pointerRef.current;
      const velocity = velocityRef.current;
      const rotation = rotationRef.current;
      const isReduced = reducedMotionRef.current;

      if (!pointer.dragging) {
        if (
          !isReduced &&
          (Math.abs(velocity.yaw) > 0.0001 || Math.abs(velocity.pitch) > 0.0001)
        ) {
          rotation.yaw += velocity.yaw * delta;
          rotation.pitch = Math.max(
            -MAX_PITCH,
            Math.min(MAX_PITCH, rotation.pitch + velocity.pitch * delta),
          );
          const friction = Math.pow(0.92, delta / 16.67);
          velocity.yaw *= friction;
          velocity.pitch *= friction;
        } else if (!focusedWithinRef.current && !isReduced) {
          const activeMultiplier = activeIndexRef.current >= 0 ? 0.22 : 1;
          rotation.yaw += 0.000018 * delta * activeMultiplier;
        }
      }

      const { width, height, radius } = dimensionsRef.current;
      const centerX = width / 2;
      const centerY = height / 2;
      const projectPoint = (point: { x: number; y: number; z: number }) => {
        const rotated = rotatePoint(point, rotation.yaw, rotation.pitch);
        const perspective = 2.8 / (2.8 - rotated.z * 0.62);
        const depth = (rotated.z + 1) / 2;

        return {
          x: centerX + rotated.x * radius * perspective,
          y: centerY + rotated.y * radius * perspective,
          z: rotated.z,
          depth,
          scale: (0.72 + depth * 0.42) * perspective,
        };
      };
      const projected: ProjectedPoint[] = points.map(projectPoint);

      context.clearRect(0, 0, width, height);

      const drawSphereSegment = (
        start: ProjectedPoint,
        end: ProjectedPoint,
      ) => {
        const depth = Math.max(0, Math.min(start.depth, end.depth));
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = `rgba(207, 255, 116, ${0.018 + depth * 0.055})`;
        context.lineWidth = 0.48 + depth * 0.26;
        context.stroke();
      };

      for (let latitudeIndex = -3; latitudeIndex <= 3; latitudeIndex += 1) {
        const latitude = latitudeIndex * (Math.PI / 9);
        const ringRadius = Math.cos(latitude);
        const ringHeight = Math.sin(latitude);
        let previous = projectPoint({
          x: ringRadius,
          y: ringHeight,
          z: 0,
        });

        for (let segment = 1; segment <= 48; segment += 1) {
          const angle = (segment / 48) * Math.PI * 2;
          const current = projectPoint({
            x: Math.cos(angle) * ringRadius,
            y: ringHeight,
            z: Math.sin(angle) * ringRadius,
          });
          drawSphereSegment(previous, current);
          previous = current;
        }
      }

      for (let longitudeIndex = 0; longitudeIndex < 10; longitudeIndex += 1) {
        const longitude = (longitudeIndex / 10) * Math.PI;
        let previous = projectPoint({
          x: 0,
          y: -1,
          z: 0,
        });

        for (let segment = 1; segment <= 36; segment += 1) {
          const latitude = -Math.PI / 2 + (segment / 36) * Math.PI;
          const latitudeRadius = Math.cos(latitude);
          const current = projectPoint({
            x: Math.cos(longitude) * latitudeRadius,
            y: Math.sin(latitude),
            z: Math.sin(longitude) * latitudeRadius,
          });
          drawSphereSegment(previous, current);
          previous = current;
        }
      }

      connections.forEach(([startIndex, endIndex]) => {
        const start = projected[startIndex];
        const end = projected[endIndex];
        const active =
          activeIndexRef.current === startIndex ||
          activeIndexRef.current === endIndex;
        const depth = Math.max(0, Math.min(start.depth, end.depth));

        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = active
          ? `rgba(207, 255, 116, ${0.3 + depth * 0.38})`
          : `rgba(232, 222, 255, ${0.035 + depth * 0.13})`;
        context.lineWidth = active ? 1.3 : 0.72;
        context.stroke();
      });

      projected.forEach((point, index) => {
        const node = nodeRefs.current[index];
        if (!node) return;

        const active = activeIndexRef.current === index;
        const opacity = Math.max(0.2, 0.28 + point.depth * 0.72);
        const scale = point.scale * (active ? 1.12 : 1);
        node.style.left = `${point.x}px`;
        node.style.top = `${point.y}px`;
        node.style.zIndex = `${100 + Math.round(point.depth * 100)}`;
        node.style.opacity = `${active ? 1 : opacity}`;
        node.style.transform = `translate(-50%, -50%) scale(${scale})`;
        node.style.setProperty("--skill-depth", `${point.depth}`);

        context.beginPath();
        context.arc(point.x, point.y, active ? 3.2 : 1.7, 0, Math.PI * 2);
        context.fillStyle = active
          ? "rgba(207, 255, 116, 0.9)"
          : `rgba(207, 255, 116, ${0.08 + point.depth * 0.28})`;
        context.fill();
      });

      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { rootMargin: "240px 0px" },
    );
    const handleVisibility = () => {
      tabVisibleRef.current = document.visibilityState === "visible";
    };
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      velocityRef.current = { yaw: 0, pitch: 0 };
    };

    resize();
    resizeObserver.observe(shell);
    intersectionObserver.observe(shell);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionChange);
    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [connections, points]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const shell = shellRef.current;
    if (!shell) return;

    const target = event.target as HTMLElement;
    target.closest<HTMLButtonElement>(".skill-node")?.focus();
    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragging: true,
    };
    velocityRef.current = { yaw: 0, pitch: 0 };
    shell.dataset.dragging = "true";
    shell.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer.dragging || pointer.id !== event.pointerId) return;

    const deltaX = event.clientX - pointer.x;
    const deltaY = event.clientY - pointer.y;
    const yawDelta = deltaX * 0.006;
    const pitchDelta = deltaY * 0.005;
    rotationRef.current.yaw += yawDelta;
    rotationRef.current.pitch = Math.max(
      -MAX_PITCH,
      Math.min(MAX_PITCH, rotationRef.current.pitch + pitchDelta),
    );
    velocityRef.current = {
      yaw: yawDelta / 16.67,
      pitch: pitchDelta / 16.67,
    };
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const shell = shellRef.current;
    const pointer = pointerRef.current;
    if (!shell || !pointer.dragging || pointer.id !== event.pointerId) return;

    pointer.dragging = false;
    shell.dataset.dragging = "false";
    if (shell.hasPointerCapture(event.pointerId)) {
      shell.releasePointerCapture(event.pointerId);
    }
    if (reducedMotionRef.current) {
      velocityRef.current = { yaw: 0, pitch: 0 };
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.2 : 0.1;
    if (event.key === "ArrowLeft") rotationRef.current.yaw -= step;
    else if (event.key === "ArrowRight") rotationRef.current.yaw += step;
    else if (event.key === "ArrowUp") {
      rotationRef.current.pitch = Math.max(
        -MAX_PITCH,
        rotationRef.current.pitch - step,
      );
    } else if (event.key === "ArrowDown") {
      rotationRef.current.pitch = Math.min(
        MAX_PITCH,
        rotationRef.current.pitch + step,
      );
    } else return;

    velocityRef.current = { yaw: 0, pitch: 0 };
    event.preventDefault();
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    focusedWithinRef.current = event.currentTarget.contains(
      event.relatedTarget,
    );
    if (!focusedWithinRef.current) activeIndexRef.current = -1;
  };

  return (
    <div className="skill-sphere-stage">
      <div
        ref={shellRef}
        className="skill-sphere"
        data-ready={ready ? "true" : "false"}
        data-dragging="false"
        role="application"
        tabIndex={0}
        aria-label="Interactive 3D sphere of Omar's technology skills"
        aria-describedby="skill-sphere-instructions"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          focusedWithinRef.current = true;
          velocityRef.current = { yaw: 0, pitch: 0 };
        }}
        onBlur={handleBlur}
      >
        <canvas
          ref={canvasRef}
          className="skill-network-canvas"
          aria-hidden="true"
        />

        <p className="skill-sphere-loading" aria-live="polite">
          Building skill network…
        </p>

        {skills.map((skill, index) => {
          const point = points[index];
          const initialDepth = (point.z + 1) / 2;

          return (
            <button
              key={skill.name}
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              className="skill-node"
              type="button"
              aria-label={skill.name}
              style={{
                left: `${(50 + point.x * 38).toFixed(4)}%`,
                top: `${(50 + point.y * 38).toFixed(4)}%`,
                opacity: (0.28 + initialDepth * 0.72).toFixed(5),
                zIndex: `${100 + Math.round(initialDepth * 100)}`,
                transform: `translate(-50%, -50%) scale(${(0.72 + initialDepth * 0.42).toFixed(5)})`,
              }}
              onPointerEnter={() => {
                activeIndexRef.current = index;
              }}
              onPointerLeave={() => {
                if (document.activeElement !== nodeRefs.current[index]) {
                  activeIndexRef.current = -1;
                }
              }}
              onFocus={() => {
                activeIndexRef.current = index;
                focusedWithinRef.current = true;
              }}
              onBlur={() => {
                activeIndexRef.current = -1;
              }}
            >
              <span className="skill-logo-shell" aria-hidden="true">
                <Image
                  src={skill.logo}
                  alt=""
                  width={48}
                  height={48}
                  draggable={false}
                  unoptimized
                />
              </span>
              <span className="skill-node-tooltip" role="tooltip">
                {skill.name}
              </span>
            </button>
          );
        })}
      </div>

      <p id="skill-sphere-instructions" className="sr-only">
        Focus the sphere and use the arrow keys to rotate it. Each technology
        logo can also receive keyboard focus.
      </p>

      <SkillsFallbackGrid
        skills={skills}
        className="sr-only skills-semantic-list"
      />
      <noscript>
        <SkillsFallbackGrid skills={skills} />
      </noscript>
    </div>
  );
}
