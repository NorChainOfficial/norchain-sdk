"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useSpring } from "framer-motion";

interface GlobeProps {
  readonly className?: string;
}

export const Globe = ({ className = "" }: GlobeProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const focusRef = useRef([0, 0]);

  const updatePointer = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      updatePointer(clientX);
    }
  };

  const r = useSpring(0, {
    damping: 20,
    stiffness: 200,
  });

  useEffect(() => {
    let phi = 0;
    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 3,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [0.2, 0.4, 1],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.2, 0.4, 1],
      markers: [
        // Major tech hubs and blockchain nodes
        { location: [37.7595, -122.4367], size: 0.08 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.08 }, // New York
        { location: [51.5074, -0.1278], size: 0.08 }, // London
        { location: [52.52, 13.405], size: 0.06 }, // Berlin
        { location: [48.8566, 2.3522], size: 0.06 }, // Paris
        { location: [35.6762, 139.6503], size: 0.08 }, // Tokyo
        { location: [1.3521, 103.8198], size: 0.08 }, // Singapore
        { location: [-33.8688, 151.2093], size: 0.06 }, // Sydney
        { location: [55.7558, 37.6173], size: 0.06 }, // Moscow
        { location: [39.9042, 116.4074], size: 0.07 }, // Beijing
        { location: [19.076, 72.8777], size: 0.06 }, // Mumbai
        { location: [25.2048, 55.2708], size: 0.07 }, // Dubai
        { location: [43.6532, -79.3832], size: 0.06 }, // Toronto
        { location: [-23.5505, -46.6333], size: 0.06 }, // São Paulo
        { location: [37.5665, 126.978], size: 0.06 }, // Seoul
      ],
      onRender: (state) => {
        // Auto-rotate
        if (!pointerInteracting.current) {
          phi += 0.005;
        }
        state.phi = phi + r.get();
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [r]);

  return (
    <div className={className}>
      <div className="relative aspect-square w-full max-w-[600px] mx-auto">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) =>
            updatePointer(
              e.clientX - pointerInteractionMovement.current
            )
          }
          onPointerUp={() => updatePointer(null)}
          onPointerOut={() => updatePointer(null)}
          onMouseMove={(e) => updateMovement(e.clientX)}
          onTouchMove={(e) =>
            e.touches[0] && updateMovement(e.touches[0].clientX)
          }
          className="w-full h-full cursor-grab opacity-0 transition-opacity duration-1000"
          style={{
            contain: "layout paint size",
            opacity: 0,
          }}
        />

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  );
};
